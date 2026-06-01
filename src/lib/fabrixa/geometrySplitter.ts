/**
 * geometrySplitter.ts
 *
 * Splits a loaded GLB scene so every garment part has its own named mesh.
 *
 * SINGLE-MESH models (geometry_0 / PrincipledMaterial):
 *   Vertex positions are normalized to [0,1] within the bounding box.
 *   Each vertex is assigned to a part by a garment-specific rule function.
 *   Faces (triangles) are assigned by majority vote of their 3 vertices.
 *   One new BufferGeometry is created per part and wrapped in a named Mesh.
 *
 * MULTI-MESH models (e.g. gown with 17 pattern pieces):
 *   The centroid of each sub-mesh is computed and the same rule function maps
 *   it to a part.  All sub-meshes for a part are grouped under a single
 *   THREE.Group whose name equals the part id.
 */

import * as THREE from "three";
import type { GarmentType } from "./garments";
import type { GarmentTypeId } from "./garments";

// ─── part-assignment function type ──────────────────────────────────────────

/** nx, ny, nz: normalized 0→1 in bbox.  cx = nx-0.5 (centred). */
type AssignFn = (nx: number, ny: number, nz: number, cx: number) => string;

// ─── per-garment spatial rules ───────────────────────────────────────────────

function makeAssignFn(garmentId: string, defaultPartId: string): AssignFn {
  switch (garmentId as GarmentTypeId) {

    case "shirt":
      return (nx, ny, _nz, cx) => {
        if (ny > 0.86 && Math.abs(cx) < 0.30) return "collar";
        if (Math.abs(cx) > 0.42)              return ny < 0.29 ? "cuffs" : "sleeves";
        return "body";
      };

    case "tshirt":
      return (nx, ny, _nz, cx) => {
        if (ny > 0.87 && Math.abs(cx) < 0.28) return "collar";
        if (Math.abs(cx) > 0.45)              return "sleeves";
        return "body";
      };

    case "hoodie":
      return (nx, ny, nz, cx) => {
        if (ny > 0.80 && Math.abs(cx) < 0.38) return "hood";
        if (Math.abs(cx) > 0.43)              return ny < 0.26 ? "cuffs" : "sleeves";
        if (nz > 0.72 && ny < 0.40 && ny > 0.16 && Math.abs(cx) < 0.30) return "pocket";
        return "body";
      };

    case "pant":
      return (nx, ny, nz, cx) => {
        if (ny > 0.88) return "waistband";
        if (nz > 0.72 && Math.abs(cx) < 0.22 && ny > 0.54 && ny < 0.87) return "pocket";
        return "legs";
      };

    case "trackpants":
      return (nx, ny, _nz, cx) => {
        if (ny > 0.88)         return "waistband";
        if (Math.abs(cx) > 0.44) return "stripes";
        return "legs";
      };

    case "skirt":
      return (nx, ny, _nz, _cx) => ny > 0.87 ? "waistband" : "skirt";

    case "plazo":
      return (nx, ny, _nz, _cx) => ny > 0.88 ? "waistband" : "legs";

    case "salwar":
      return (nx, ny, _nz, _cx) => {
        if (ny > 0.88) return "waistband";
        if (ny < 0.09) return "cuffs";
        return "legs";
      };

    case "lehenga":
      return (nx, ny, nz, cx) => {
        if (ny > 0.64)                               return "blouse";
        if (ny < 0.10)                               return "border";
        if (nz > 0.66 && ny > 0.27 && ny < 0.64)   return "dupatta";
        return "skirt";
      };

    case "gown":
    case "dress":
      return (nx, ny, _nz, cx) => {
        if (ny > 0.63)           return "bodice";
        if (ny < 0.08)           return "trim";
        if (Math.abs(cx) > 0.43) return "sleeves";
        return "skirt";
      };

    case "kurti":
      return (nx, ny, _nz, cx) => {
        if (ny > 0.87 && Math.abs(cx) < 0.32) return "neckline";
        if (Math.abs(cx) > 0.50)              return "sleeves";
        if (ny < 0.08)                         return "hem";
        return "body";
      };

    case "kurti_long":
      return (nx, ny, _nz, cx) => {
        if (Math.abs(cx) > 0.52) return "sleeves";
        if (ny < 0.06)           return "hem";
        return "body";
      };

    case "kurti_long_neck":
      return (nx, ny, _nz, cx) => {
        if (ny > 0.82 && Math.abs(cx) < 0.30) return "neck";
        if (Math.abs(cx) > 0.52)              return "sleeves";
        if (ny < 0.06)                         return "hem";
        return "body";
      };

    case "kurta":
      return (nx, ny, nz, cx) => {
        if (ny > 0.89 && Math.abs(cx) < 0.26)            return "collar";
        if (Math.abs(cx) > 0.46)                          return "sleeves";
        if (nz > 0.77 && Math.abs(cx) < 0.07 && ny > 0.24 && ny < 0.87) return "placket";
        return "body";
      };

    case "coat":
      return (nx, ny, nz, cx) => {
        if (ny > 0.89 && Math.abs(cx) < 0.35) return "collar";
        if (Math.abs(cx) > 0.43)              return "sleeves";
        if (nz > 0.73 && Math.abs(cx) > 0.15 && Math.abs(cx) < 0.37 && ny > 0.41 && ny < 0.87) return "lapel";
        return "body";
      };

    case "jacket":
      return (nx, ny, _nz, cx) => {
        if (ny > 0.87 && Math.abs(cx) < 0.31) return "collar";
        if (Math.abs(cx) > 0.44)              return "sleeves";
        return "body";
      };

    default:
      return () => defaultPartId;
  }
}

// ─── public entry point ───────────────────────────────────────────────────────

/**
 * Returns a new THREE.Group where every child mesh is named after a garment
 * part id.  The original `scene` is NOT mutated.
 */
export function splitGarmentScene(
  garment: GarmentType,
  scene: THREE.Group,
): THREE.Group {
  const parts = garment.parts;

  // Single-part garments: just name the first mesh
  if (!parts || parts.length <= 1) {
    const first = parts?.[0];
    if (first) scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.name = first.id; });
    return scene;
  }

  // Collect meshes and world-update
  scene.updateWorldMatrix(true, true);

  const allMeshes: THREE.Mesh[] = [];
  scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) allMeshes.push(o as THREE.Mesh); });
  if (allMeshes.length === 0) return scene;

  // Bounding box of entire scene (world space)
  const bbox = new THREE.Box3().setFromObject(scene);
  const range = new THREE.Vector3(
    Math.max(bbox.max.x - bbox.min.x, 1e-4),
    Math.max(bbox.max.y - bbox.min.y, 1e-4),
    Math.max(bbox.max.z - bbox.min.z, 1e-4),
  );

  const assignFn = makeAssignFn(garment.id, parts[0].id);
  const result = new THREE.Group();

  // ── MULTI-MESH: group existing meshes by centroid ─────────────────────────
  if (allMeshes.length > 1) {
    const buckets = new Map<string, THREE.Object3D[]>(
      parts.map((p) => [p.id, []]),
    );

    for (const mesh of allMeshes) {
      const center = new THREE.Vector3();
      new THREE.Box3().setFromObject(mesh).getCenter(center);
      const nx = (center.x - bbox.min.x) / range.x;
      const ny = (center.y - bbox.min.y) / range.y;
      const nz = (center.z - bbox.min.z) / range.z;
      const pid = resolveOrFallback(assignFn(nx, ny, nz, nx - 0.5), buckets, parts[0].id);
      buckets.get(pid)!.push(mesh.clone());
    }

    for (const [pid, objs] of buckets) {
      if (objs.length === 0) continue;
      if (objs.length === 1) {
        objs[0].name = pid;
        result.add(objs[0]);
      } else {
        const g = new THREE.Group();
        g.name = pid;
        objs.forEach((o) => { o.name = pid; g.add(o); });
        result.add(g);
      }
    }

    return result;
  }

  // ── SINGLE-MESH: split geometry by vertex position ────────────────────────
  const mesh = allMeshes[0];

  // Bake mesh world-matrix into a geometry copy so splits are in world space
  const geomSrc = mesh.geometry as THREE.BufferGeometry;
  const geom = geomSrc.clone();
  geom.applyMatrix4(mesh.matrixWorld);

  const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
  const subGeoms = splitGeometry(geom, assignFn, parts, bbox, range);

  for (const [pid, subGeom] of subGeoms) {
    const mat = (material as THREE.Material).clone();
    const subMesh = new THREE.Mesh(subGeom, mat);
    subMesh.name = pid;
    subMesh.castShadow = true;
    subMesh.receiveShadow = true;
    result.add(subMesh);
  }

  return result;
}

// ─── geometry splitting helper ────────────────────────────────────────────────

function splitGeometry(
  geom: THREE.BufferGeometry,
  assignFn: AssignFn,
  parts: Array<{ id: string }>,
  bbox: THREE.Box3,
  range: THREE.Vector3,
): Map<string, THREE.BufferGeometry> {
  const posAttr = geom.attributes.position as THREE.BufferAttribute;
  const norAttr = geom.attributes.normal as THREE.BufferAttribute | null ?? null;
  const uvAttr  = geom.attributes.uv  as THREE.BufferAttribute | null ?? null;
  const idx     = geom.index;

  // Assign every vertex to a part
  const vPart = new Uint16Array(posAttr.count);
  const pidToIdx = new Map(parts.map((p, i) => [p.id, i]));
  const idxToPid = parts.map((p) => p.id);

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const nx = (x - bbox.min.x) / range.x;
    const ny = (y - bbox.min.y) / range.y;
    const nz = (z - bbox.min.z) / range.z;
    const pid = assignFn(nx, ny, nz, nx - 0.5);
    vPart[i] = pidToIdx.get(pid) ?? 0;
  }

  // Collect face vertex arrays per part (un-indexed → vertices may repeat)
  const faceVerts = new Array<number[]>(parts.length).fill(null!).map(() => []);

  const triCount = idx ? idx.count / 3 : posAttr.count / 3;
  for (let t = 0; t < triCount; t++) {
    let a: number, b: number, c: number;
    if (idx) {
      a = idx.getX(t * 3);
      b = idx.getX(t * 3 + 1);
      c = idx.getX(t * 3 + 2);
    } else {
      a = t * 3; b = t * 3 + 1; c = t * 3 + 2;
    }

    // Majority vote for face part
    const pa = vPart[a], pb = vPart[b], pc = vPart[c];
    let winner = pa;
    if (pb === pc) winner = pb;
    else if (pa === pc) winner = pa;
    else if (pa === pb) winner = pa;

    faceVerts[winner].push(a, b, c);
  }

  const result = new Map<string, THREE.BufferGeometry>();

  for (let pi = 0; pi < parts.length; pi++) {
    const verts = faceVerts[pi];
    if (verts.length === 0) continue;

    const n = verts.length;
    const newPos = new Float32Array(n * 3);
    const newNor = norAttr ? new Float32Array(n * 3) : null;
    const newUv  = uvAttr  ? new Float32Array(n * 2) : null;

    for (let i = 0; i < n; i++) {
      const vi = verts[i];
      newPos[i * 3]     = posAttr.getX(vi);
      newPos[i * 3 + 1] = posAttr.getY(vi);
      newPos[i * 3 + 2] = posAttr.getZ(vi);
      if (newNor && norAttr) {
        newNor[i * 3]     = norAttr.getX(vi);
        newNor[i * 3 + 1] = norAttr.getY(vi);
        newNor[i * 3 + 2] = norAttr.getZ(vi);
      }
      if (newUv && uvAttr) {
        newUv[i * 2]     = uvAttr.getX(vi);
        newUv[i * 2 + 1] = uvAttr.getY(vi);
      }
    }

    const bg = new THREE.BufferGeometry();
    bg.setAttribute("position", new THREE.BufferAttribute(newPos, 3));
    if (newNor) bg.setAttribute("normal", new THREE.BufferAttribute(newNor, 3));
    if (newUv)  bg.setAttribute("uv",     new THREE.BufferAttribute(newUv, 2));

    // Recompute normals if none in source (handles flat-shaded meshes)
    if (!newNor) bg.computeVertexNormals();
    bg.computeBoundingSphere();

    result.set(idxToPid[pi], bg);
  }

  return result;
}

// ─── utility ─────────────────────────────────────────────────────────────────

function resolveOrFallback(
  pid: string,
  buckets: Map<string, unknown[]>,
  fallback: string,
): string {
  return buckets.has(pid) ? pid : fallback;
}
