// Per-user credit ledger.
// - Local-first: works offline via localStorage.
// - When signed in, syncs to Supabase users table (coinBalance) and coin_transactions table.
import { APP_DATA_0 } from "@/lib/fabrixa/APP_DATA_0";
import { getSupabase } from "@/lib/fabrixa/supabase";

export type CreditAction = keyof typeof APP_DATA_0.credits.costs;

export interface CreditLedger {
  balance: number;
  lastGrantDay: string;
  totals: { exports: number; aiDesigns: number; renders3d: number };
  today: { day: string; exports: number; aiDesigns: number; renders3d: number };
  updatedAt?: unknown;
}

const LS_KEY = "fabrixa:credits";
const today = () => new Date().toISOString().slice(0, 10);

export function emptyLedger(): CreditLedger {
  return {
    balance: APP_DATA_0.credits.startingBalance,
    lastGrantDay: "",
    totals: { exports: 0, aiDesigns: 0, renders3d: 0 },
    today: { day: today(), exports: 0, aiDesigns: 0, renders3d: 0 },
  };
}

function readLocal(): CreditLedger {
  if (typeof window === "undefined") return emptyLedger();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return emptyLedger();
    const parsed = JSON.parse(raw) as CreditLedger;
    if (parsed.today?.day !== today()) {
      parsed.today = { day: today(), exports: 0, aiDesigns: 0, renders3d: 0 };
    }
    return { ...emptyLedger(), ...parsed };
  } catch {
    return emptyLedger();
  }
}

function writeLocal(l: CreditLedger) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(l));
  } catch { /* ignore */ }
}

export async function loadLedger(uid: string | null): Promise<CreditLedger> {
  const local = readLocal();
  if (!uid) return grantDailyIfNeeded(local);
  try {
    const supabase = getSupabase();
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("coinBalance, lastDailyResetAt")
      .eq("id", uid)
      .single();
    if (userError || !user) return grantDailyIfNeeded(local);

    const { data: todayTransactions } = await supabase
      .from("coin_transactions")
      .select("reason")
      .eq("user_id", uid)
      .gte("created_at", `${today()}T00:00:00`)
      .lt("created_at", `${today()}T23:59:59`);

    const ledger: CreditLedger = {
      balance: user.coinBalance ?? APP_DATA_0.credits.startingBalance,
      lastGrantDay: user.lastDailyResetAt?.slice(0, 10) || "",
      totals: { exports: 0, aiDesigns: 0, renders3d: 0 },
      today: {
        day: today(),
        exports: todayTransactions?.filter(t => t.reason === "export").length || 0,
        aiDesigns: todayTransactions?.filter(t => t.reason?.includes("ai")).length || 0,
        renders3d: todayTransactions?.filter(t => t.reason === "render3d").length || 0,
      },
    };

    const merged = grantDailyIfNeeded(ledger);
    writeLocal(merged);
    return merged;
  } catch {
    return grantDailyIfNeeded(local);
  }
}

export async function saveLedger(uid: string | null, l: CreditLedger): Promise<void> {
  writeLocal(l);
  if (!uid) return;
  try {
    const supabase = getSupabase();
    await supabase
      .from("users")
      .update({ coinBalance: l.balance, lastDailyResetAt: new Date().toISOString() })
      .eq("id", uid);
  } catch { /* ignore */ }
}

function grantDailyIfNeeded(l: CreditLedger): CreditLedger {
  const d = today();
  if (l.lastGrantDay !== d) {
    return {
      ...l,
      lastGrantDay: d,
      balance: l.balance + APP_DATA_0.credits.dailyFreeGrant,
    };
  }
  return l;
}

export function costOf(action: CreditAction): number {
  return APP_DATA_0.credits.costs[action] ?? 0;
}

export function costOfRender3dType(typeId: string): number {
  const map = APP_DATA_0.credits.render3dByType as Record<string, number>;
  return map?.[typeId] ?? APP_DATA_0.credits.costs.render3d;
}

export function canAfford(l: CreditLedger, action: CreditAction): boolean {
  return l.balance >= costOf(action);
}

export function canAffordAmount(l: CreditLedger, amount: number): boolean {
  return l.balance >= amount;
}

export async function recordTransaction(
  uid: string | null,
  l: CreditLedger,
  action: CreditAction,
  amount: number,
): Promise<CreditLedger> {
  const next: CreditLedger = {
    ...l,
    balance: Math.max(0, l.balance - amount),
    totals: { ...l.totals },
    today: { ...l.today, day: today() },
  };

  if (action === "export") {
    next.totals.exports++;
    next.today.exports++;
  }
  if (
    action === "aiImageGen" ||
    action === "aiImageEdit" ||
    action === "aiNeckDesign"
  ) {
    next.totals.aiDesigns++;
    next.today.aiDesigns++;
  }
  if (action === "render3d") {
    next.totals.renders3d++;
    next.today.renders3d++;
  }

  writeLocal(next);

  if (uid) {
    try {
      const supabase = getSupabase();
      await supabase.from("coin_transactions").insert([
        {
          user_id: uid,
          delta: -amount,
          reason: action,
          balance_after: next.balance,
        },
      ]);
      await supabase
        .from("users")
        .update({ coinBalance: next.balance })
        .eq("id", uid);
    } catch { /* ignore */ }
  }

  return next;
}

export function spendAmount(
  l: CreditLedger,
  action: CreditAction,
  amount: number,
): CreditLedger {
  const next: CreditLedger = {
    ...l,
    balance: Math.max(0, l.balance - amount),
    totals: { ...l.totals },
    today: { ...l.today, day: today() },
  };
  if (action === "export") {
    next.totals.exports++;
    next.today.exports++;
  }
  if (
    action === "aiImageGen" ||
    action === "aiImageEdit" ||
    action === "aiNeckDesign"
  ) {
    next.totals.aiDesigns++;
    next.today.aiDesigns++;
  }
  if (action === "render3d") {
    next.totals.renders3d++;
    next.today.renders3d++;
  }
  return next;
}

export function spend(l: CreditLedger, action: CreditAction): CreditLedger {
  const cost = costOf(action);
  const next: CreditLedger = {
    ...l,
    balance: Math.max(0, l.balance - cost),
    totals: { ...l.totals },
    today: { ...l.today, day: today() },
  };
  if (action === "export") {
    next.totals.exports++;
    next.today.exports++;
  }
  if (
    action === "aiImageGen" ||
    action === "aiImageEdit" ||
    action === "aiNeckDesign"
  ) {
    next.totals.aiDesigns++;
    next.today.aiDesigns++;
  }
  if (action === "render3d") {
    next.totals.renders3d++;
    next.today.renders3d++;
  }
  return next;
}