// Dynamic GLB model loader for garments.
//
// Looks for /models/<garment>.glb (served from /public). Caches the loaded
// scene and hands back a freshly cloned scene each time so multiple consumers
// can mutate materials independently without affecting the cache.
//
// On missing file or load error, returns { ok: false } so the caller can
// render the procedural fallback mesh instead. Never throws.

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { ensureGeometryUV, normalizeGarmentMaterial } from "./meshUtils";
import { splitGarmentScene } from "./geometrySplitter";
import type { GarmentType } from "./garments";

// Bundle every GLB under src/assets/models as a hashed URL. This lets the
// dev server / worker serve them reliably instead of relying on /public,
// which the preview proxy doesn't pass through to Vite.
import { resolveBundledGlbUrl } from "./garmentAssets";

function resolveBundledGlb(path: string): string | null {
  return resolveBundledGlbUrl(path);
}

type CacheEntry =
  | { status: "loading"; promise: Promise<LoadResult> }
  | { status: "loaded"; scene: THREE.Group }
  | { status: "error"; error: Error };

export interface LoadResult {
  ok: boolean;
  scene?: THREE.Group;
  error?: Error;
}

const cache = new Map<string, CacheEntry>();

let _loader: GLTFLoader | null = null;
function getLoader(): GLTFLoader {
  if (_loader) return _loader;
  const loader = new GLTFLoader();
  // Optional DRACO support — loader only fetches the decoder if a DRACO'd model is loaded.
  try {
    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(draco);
  } catch {
    /* DRACO optional */
  }
  _loader = loader;
  return loader;
}

/**
 * Quick GET probe — some preview proxies block HEAD with a redirect, so we
 * issue a normal GET and only read the first byte's headers. We then let
 * GLTFLoader fetch the real bytes (its own cache will dedupe).
 */
async function exists(path: string): Promise<boolean> {
  try {
    const res = await fetch(path, { method: "GET", cache: "force-cache" });
    if (!res.ok) return false;
    const ct = (res.headers.get("content-type") ?? "").toLowerCase();
    // HTML fallback page = not a real model file.
    if (ct.includes("text/html")) return false;
    return true;
  } catch {
    return false;
  }
}

export async function loadGarmentModel(
  path: string,
  garment?: GarmentType,
): Promise<LoadResult> {
  if (typeof window === "undefined") return { ok: false };

  // Prefer bundled asset; fall back to /public path for backwards-compat.
  const bundled = resolveBundledGlb(path);
  const url = bundled ?? (path.startsWith("/") ? path : `/${path}`);

  // Cache key includes garment id so different garments don't share the same
  // split scene (even if they happened to reference the same GLB file).
  const cacheKey = garment ? `${url}::${garment.id}` : url;

  const cached = cache.get(cacheKey);
  if (cached) {
    if (cached.status === "loaded") {
      return { ok: true, scene: cloneScene(cached.scene) };
    }
    if (cached.status === "error") {
      return { ok: false, error: cached.error };
    }
    return cached.promise; // loading
  }

  const promise: Promise<LoadResult> = (async () => {
    try {
      // Fetch as ArrayBuffer + parse() rather than loader.load(url) — the
      // preview proxy intermittently aborts plain GLB requests, but a
      // straight fetch (with retry) is reliable.
      const buf = await fetchWithRetry(url, 2);
      const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
        getLoader().parse(
          buf,
          "",
          (g) => resolve(g as unknown as { scene: THREE.Group }),
          (e) => reject(e instanceof Error ? e : new Error(String(e))),
        );
      });

      // ── Normalise materials + geometry ────────────────────────────────────
      gltf.scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Unique material per mesh so recolour doesn't bleed across parts
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else if (mesh.material) {
            mesh.material = (mesh.material as THREE.Material).clone();
          }

          // Smooth shading — recompute vertex normals if missing.
          const geom = mesh.geometry as THREE.BufferGeometry | undefined;
          if (geom) {
            ensureGeometryUV(geom);
            if (!geom.attributes.normal) geom.computeVertexNormals();
            if (geom.attributes.uv && geom.index && !geom.attributes.tangent) {
              try { geom.computeTangents(); } catch { /* optional */ }
            }
          }

          // Upgrade to MeshPhysicalMaterial for sheen/clearcoat support
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map((m) =>
                m ? normalizeGarmentMaterial(m) : m,
              );
            } else {
              mesh.material = normalizeGarmentMaterial(mesh.material);
            }
          }

          // Double-sided + crisp texture sampling
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mm of mats) {
            if (!mm) continue;
            (mm as THREE.Material).side = THREE.DoubleSide;
            const phys = mm as THREE.MeshPhysicalMaterial;
            for (const t of [
              phys.map, phys.normalMap, phys.roughnessMap,
              phys.metalnessMap, phys.emissiveMap,
            ]) {
              if (!t) continue;
              t.anisotropy = Math.max(t.anisotropy ?? 1, 16);
              t.minFilter = THREE.LinearMipmapLinearFilter;
              t.magFilter = THREE.LinearFilter;
              t.generateMipmaps = true;
              t.needsUpdate = true;
            }
            if (phys.map) phys.map.colorSpace = THREE.SRGBColorSpace;
            phys.needsUpdate = true;
          }
        }
      });

      // ── Split scene into per-part sub-meshes ─────────────────────────────
      let finalScene: THREE.Group = gltf.scene;
      if (garment) {
        try {
          finalScene = splitGarmentScene(garment, gltf.scene);
        } catch (splitErr) {
          console.warn("[fabrixa] geometry split failed, using raw scene:", splitErr);
          finalScene = gltf.scene;
        }
      }

      cache.set(cacheKey, { status: "loaded", scene: finalScene });
      return { ok: true, scene: cloneScene(finalScene) };
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.warn("[fabrixa] model load failed, using fallback:", url, err.message);
      cache.set(cacheKey, { status: "error", error: err });
      return { ok: false, error: err };
    }
  })();

  cache.set(cacheKey, { status: "loading", promise });
  return promise;
}

async function fetchWithRetry(url: string, retries: number): Promise<ArrayBuffer> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ct = (res.headers.get("content-type") ?? "").toLowerCase();
      if (ct.includes("text/html")) throw new Error("HTML fallback (not a model)");
      return await res.arrayBuffer();
    } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise((r) => setTimeout(r, 250 * (i + 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/** Clone a scene including skinned mesh skeletons so consumers can mutate safely. */
function cloneScene(scene: THREE.Group): THREE.Group {
  const cloned = cloneSkeleton(scene) as THREE.Group;
  // Per-instance unique materials (so per-instance color changes don't bleed)
  cloned.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      const mesh = obj as THREE.Mesh;
      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((m) => m.clone());
      } else if (mesh.material) {
        mesh.material = (mesh.material as THREE.Material).clone();
      }
    }
  });
  return cloned;
}

/**
 * Dispose a per-instance clone. We ONLY dispose the cloned materials —
 * geometries are SHARED with the cache (SkeletonUtils.clone reuses them)
 * and disposing them here corrupts the cache, causing a WebGL crash the
 * next time the same garment is loaded ("Cannot read … of disposed
 * BufferGeometry"). Textures applied via textureCache are ref-counted
 * separately by the caller via releaseAllMaterialTextures.
 */
export function disposeScene(scene: THREE.Object3D) {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (!m) continue;
      // Do NOT dispose .map — owned by textureCache (ref-counted).
      m.dispose?.();
    }
  });
}

/** Full teardown — only call when permanently leaving the app. */
export function fullyDisposeCachedScene(scene: THREE.Object3D) {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose?.();
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (!m) continue;
      const mat = m as THREE.MeshStandardMaterial;
      mat.map?.dispose?.();
      mat.normalMap?.dispose?.();
      mat.roughnessMap?.dispose?.();
      mat.metalnessMap?.dispose?.();
      mat.dispose?.();
    }
  });
}

export function clearModelCache() {
  for (const entry of cache.values()) {
    if (entry.status === "loaded") fullyDisposeCachedScene(entry.scene);
  }
  cache.clear();
}
