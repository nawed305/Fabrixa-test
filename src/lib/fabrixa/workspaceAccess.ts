import { useAuth } from "./useAuth";
import { useEntitlements } from "./entitlements";
import { useSubscriptionStore } from "./subscriptionStore";
import { isCanonicalTierActive } from "./tierMap";

/** When VITE_DEMO_MODE=true all auth + plan checks are bypassed. */
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export function useWorkspaceAccess() {
  const { user, loading: authLoading } = useAuth();
  const adminMode = useSubscriptionStore((s) => s.adminMode);
  const { data: ent, isLoading: entLoading, isFetched } = useEntitlements();

  // Demo mode: pretend we are an authenticated admin with a full plan
  if (DEMO_MODE) {
    return {
      user: null,
      ent: null,
      authLoading: false,
      entLoading: false,
      isAuthenticated: true,
      hasActivePlan: true,
      canAccessWorkspace: true,
      adminMode: true,
    };
  }

  const isAuthenticated = !!user;
  const hasActivePlan =
    adminMode ||
    (!!ent &&
      ent.subscriptionTier !== "none" &&
      isCanonicalTierActive(ent.subscriptionTier, ent.basePlanExpiry));

  const canAccessWorkspace =
    isAuthenticated &&
    hasActivePlan &&
    !authLoading &&
    (adminMode || (isFetched && !entLoading));

  return {
    user,
    ent,
    authLoading,
    entLoading,
    isAuthenticated,
    hasActivePlan,
    canAccessWorkspace,
    adminMode,
  };
}
