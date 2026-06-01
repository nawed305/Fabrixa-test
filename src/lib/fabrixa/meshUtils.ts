import * as THREE from "three";
import type { GarmentType } from "./garments";
import { resolvePartIdFromNodeName } from "./garments";

/** Generate planar UVs when a GLB mesh has none (common on CAD exports). */
export function ensureGeometryUV(geom: THREE.BufferGeometry): void {
  const uv = geom.attributes.uv;
  if (uv && uv.count > 0) return;

  const pos = geom.attributes.position;
  if (!pos) return;

  geom.computeBoundingBox();
  const box = geom.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  const min = box.min;

  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const u = size.x > 1e-6 ? (x - min.x) / size.x : 0.5;
    const v = size.y > 1e-6 ? (y - min.y) / size.y : size.z > 1e-6 ? (z - min.z) / size.z : 0.5;
    uvs[i * 2] = u;
    uvs[i * 2 + 1] = 1 - v;
  }
  geom.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geom.attributes.uv.needsUpdate = true;
}

export function resolveMeshPartId(
  garment: GarmentType,
  mesh: THREE.Mesh,
  meshIndex: number,
): string {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const candidates = [
    mesh.name,
    mesh.parent?.name ?? "",
    ...mats.map((m) => m?.name ?? ""),
  ];
  for (const n of candidates) {
    const id = resolvePartIdFromNodeName(garment, n);
    if (id) return id;
  }
  const parts = garment.parts;
  return parts[meshIndex % parts.length]?.id ?? parts[0].id;
}

/**
 * Upgrade any GLB material to MeshPhysicalMaterial.
 * MeshPhysicalMaterial supports sheen (fabric shimmer) and clearcoat
 * (silky/satin finishes) — essential for hyperrealistic garment rendering.
 */
export function normalizeGarmentMaterial(mat: THREE.Material): THREE.MeshPhysicalMaterial {
  let result: THREE.MeshPhysicalMaterial;

  if (mat instanceof THREE.MeshPhysicalMaterial) {
    mat.side = THREE.DoubleSide;
    result = mat;
  } else if (mat instanceof THREE.MeshStandardMaterial) {
    result = new THREE.MeshPhysicalMaterial({
      color: mat.color.clone(),
      roughness: mat.roughness ?? 0.65,
      metalness: mat.metalness ?? 0.0,
      map: mat.map ?? null,
      normalMap: mat.normalMap ?? null,
      roughnessMap: mat.roughnessMap ?? null,
      metalnessMap: mat.metalnessMap ?? null,
      aoMap: mat.aoMap ?? null,
      side: THREE.DoubleSide,
    });
    mat.dispose();
  } else {
    result = new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      roughness: 0.70,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });
    try {
      if ("color" in mat) result.color.copy((mat as THREE.MeshStandardMaterial).color);
      if ("map" in mat && (mat as THREE.MeshStandardMaterial).map)
        result.map = (mat as THREE.MeshStandardMaterial).map;
    } catch { /* ignore */ }
    mat.dispose();
  }

  // Default fabric-like physical properties.
  // These are overridden per-part by the fabric preset in applyPartToMaterial.
  result.sheen = 0.30;
  result.sheenRoughness = 0.65;
  result.sheenColor = new THREE.Color("#ffffff");
  result.clearcoat = 0.0;
  result.clearcoatRoughness = 0.4;
  result.envMapIntensity = 0.9;

  return result;
}
