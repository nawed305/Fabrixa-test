// =============================================================
// Cloud persistence — Unified Supabase Schema
// =============================================================
import { getSupabase } from "@/lib/fabrixa/supabase";
import type { PartState } from "@/lib/fabrixa/garments";
import { type SubscriptionTierId } from "@/lib/fabrixa/APP_DATA_0";

export interface UserDoc {
  id: string;
  subscriptionTier: SubscriptionTierId | null;
  basePlanExpiry: number | null;
  coinBalance: number;
  dailyAllowance: number;
  lastDailyResetAt: number;
  hasAiPack: boolean;
  aiPackExpiry: number | null;
  dailyAiRequestsRemaining: number;
  dailyShowroomDownloadsCount: number;
  unlockedShowroomDesigns: string[];
}

export interface ProjectDoc {
  id: string;
  userId: string;
  name: string;
  canvasState: { partStates: Record<string, PartState>; typeId: string };
  thumbnail: string;
  updatedAt: string;
}

export type SavedProject = Pick<ProjectDoc, "canvasState"> & { name?: string; thumbnail?: string };

// ---------- users table ----------
export async function loadUserDoc(uid: string): Promise<UserDoc | null> {
  const sb = getSupabase();
  const { data, error } = await sb.from("users").select("*").eq("id", uid).maybeSingle();
  if (error || !data) return null;
  return data as UserDoc;
}

export async function saveUserDoc(uid: string, data: Partial<UserDoc>): Promise<void> {
  const sb = getSupabase();
  await sb.from("users").update(data).eq("id", uid);
}

// ---------- projects table ----------
/** Save a project document to Supabase. Fallbacks handle both snake_case and camelCase columns safely. */
export async function saveProject(
  uid: string,
  data: SavedProject,
  projectId?: string,
): Promise<string> {
  const id = projectId ?? `${uid}_default`;
  const sb = getSupabase();
  
  const payload = {
    id,
    user_id: uid,
    userId: uid,
    name: data.name ?? "Untitled",
    canvas_state: data.canvasState,
    canvasState: data.canvasState,
    thumbnail: data.thumbnail ?? "",
    updated_at: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await sb.from("projects").upsert(payload);
  return id;
}

export async function loadProject(uid: string, projectId?: string): Promise<ProjectDoc | null> {
  const id = projectId ?? `${uid}_default`;
  const sb = getSupabase();
  const { data, error } = await sb.from("projects").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  
  return {
    id: data.id,
    userId: data.user_id || data.userId,
    name: data.name || "Untitled",
    canvasState: data.canvas_state || data.canvasState,
    thumbnail: data.thumbnail || "",
    updatedAt: data.updated_at || data.updatedAt,
  };
}

export async function listUserProjects(uid: string): Promise<ProjectDoc[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("projects")
    .select("*")
    .or(`user_id.eq.${uid},userId.eq.${uid}`)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data.map((d: any) => ({
    id: d.id,
    userId: d.user_id || d.userId,
    name: d.name || "Untitled",
    canvasState: d.canvas_state || d.canvasState,
    thumbnail: d.thumbnail || "",
    updatedAt: d.updated_at || d.updatedAt,
  }));
}

export async function deleteProject(projectId: string): Promise<void> {
  const sb = getSupabase();
  await sb.from("projects").delete().eq("id", projectId);
}

export async function saveNamedDesign(
  uid: string,
  name: string,
  data: { partStates: Record<string, PartState>; typeId: string; thumbnail?: string },
): Promise<string> {
  const id = `${uid}_${Date.now()}`;
  await saveProject(
    uid,
    {
      name,
      thumbnail: data.thumbnail,
      canvasState: { partStates: data.partStates, typeId: data.typeId },
    },
    id,
  );
  return id;
}

// ---------- showroomDesigns table ----------
export interface ShowroomDesign {
  id: string;
  name: string;
  imageUrl: string;
}

export async function listShowroomDesigns(): Promise<ShowroomDesign[]> {
  const sb = getSupabase();
  const { data, error } = await sb.from("showroomDesigns").select("*");
  if (error || !data) return [];
  return data as ShowroomDesign[];
}

// Legacy helpers to avoid compile breaks across old UI targets
export async function recordExport(_uid: string, _info: { format: string; quality: string; bytes?: number }) { /* no-op */ }
export async function recordAiDesign(_uid: string, _info: { task: string; prompt: string; model: string }) { /* no-op */ }
export async function recordRender3d(_uid: string, _info: { typeId: string; scene: string }) { /* no-op */ }
export async function listRecentExports(_uid: string, _n = 20): Promise<unknown[]> { return []; }