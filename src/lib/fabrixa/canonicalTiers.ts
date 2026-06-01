import { APP_DATA_0 } from "@/lib/fabrixa/APP_DATA_0";
import type { SubscriptionTierId } from "@/lib/fabrixa/APP_DATA_0";

export const CANONICAL_TIERS = APP_DATA_0.tiers;

export function canonicalTierMeta(tierId: string) {
  return CANONICAL_TIERS[tierId as SubscriptionTierId] ?? null;
}

export function canonicalTierPriceInr(tierId: string): number {
  return (CANONICAL_TIERS[tierId as SubscriptionTierId] as { priceInr?: number })?.priceInr ?? 0;
}
