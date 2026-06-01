// Maps Supabase canonical tier IDs (creator_1m, studio_1m, …) to the
// Zustand permission tiers. Returns the canonical SubscriptionTierId.
import type { SubscriptionTier } from "./entitlements";
import type { SubscriptionTierId } from "@/lib/fabrixa/APP_DATA_0";

export function storeTierFromSupabase(
  tier: SubscriptionTier,
): SubscriptionTierId | null {
  if (tier === "none") return null;
  if (tier.startsWith("creator")) return "creator_1m";
  if (tier.startsWith("studio")) return "studio_1m";
  if (tier.startsWith("enterprise")) return "enterprise_1m";
  return null;
}

export function isCanonicalTierActive(
  tier: SubscriptionTier,
  basePlanExpiry: string | null,
): boolean {
  if (tier === "none") return false;
  if (!basePlanExpiry) return false;
  const t = new Date(basePlanExpiry).getTime();
  return !Number.isNaN(t) && t > Date.now();
}
