// src/lib/fabrixa/APP_DATA_0.ts

export const APP_DATA_0 = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "your-supabase-anon-key",
  },
  ai: {
    apiKey: "server-side-proxy",
    imageModel: "gemini-2.0-flash-preview-image-generation",
    textModel: "gemini-2.0-flash",
    provider: "gemini",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    timeoutMs: 30000,
    models: {
      imageGen: "gemini-2.0-flash-preview-image-generation",
      neckDesign: "gemini-2.0-flash-preview-image-generation",
      textToPattern: "gemini-2.0-flash-preview-image-generation",
    } as const,
  },
  aiPack: {
    priceInr: 1200,
    durationDays: 30,
    dailyRequests: 20,
  } as const,
  coinCosts: {
    aiGeneration: 15,
    generatePattern: 15,
    showroomDownload: 10,
    export: 5,
    saveProject: 2,
    maskedApply: 8,
    applyToModel: 5,
    render3d: 20,
    imageUpload: 0,
  } as const,
  credits: {
    startingBalance: 100,
    dailyFreeGrant: 5,
    costs: {
      export: 5,
      aiImageGen: 12,
      aiImageEdit: 8,
      aiNeckDesign: 10,
      render3d: 20,
    } as const,
    render3dByType: {} as const,
  } as const,
  razorpay: {
    currency: "INR",
    rzp_key_id: import.meta.env.VITE_RZP_KEY_ID || "your-razorpay-key-id",
    rzp_key_secret: "",
  } as const,
  tiling: {
    defaultMode: "world" as const,
    defaultWorldScale: 0.35,
    triplanarBlend: 0.65,
  } as const,
  selection: {
    outlineColor: "#00ff00",
    defaultFeatherPx: 12,
    defaultOpacity: 0.5,
    defaultExpandPx: 8,
    defaultBrushSize: 16,
    antsDash: [6, 3] as const,
    antsSpeedMs: 200,
    maxPolygonPoints: 128,
    pointerThrottleMs: 20,
  } as const,
  perf: {
    disableAnimations: false,
    maxAnisotropy: 16,
    dprCap: 2.0,
  } as const,
  fabricPresets: {
    //                                                                                                 sheenColor = the fabric's characteristic iridescent hue
    cotton:   { label: "Cotton",   roughness: 0.82, metalness: 0.00, baseColor: "#ffffff", sheen: 0.05, sheenRoughness: 0.60, sheenColor: "#ffffff", clearcoat: 0.00, clearcoatRoughness: 0.50, envIntensity: 0.40 },
    silk:     { label: "Silk",     roughness: 0.18, metalness: 0.02, baseColor: "#f9f2ed", sheen: 0.90, sheenRoughness: 0.15, sheenColor: "#f5e8c0", clearcoat: 0.15, clearcoatRoughness: 0.30, envIntensity: 0.60 },
    satin:    { label: "Satin",    roughness: 0.14, metalness: 0.06, baseColor: "#f4e6d8", sheen: 0.95, sheenRoughness: 0.08, sheenColor: "#fff0d0", clearcoat: 0.30, clearcoatRoughness: 0.20, envIntensity: 0.65 },
    velvet:   { label: "Velvet",   roughness: 0.96, metalness: 0.00, baseColor: "#4b1226", sheen: 1.00, sheenRoughness: 0.65, sheenColor: "#8b2244", clearcoat: 0.00, clearcoatRoughness: 0.80, envIntensity: 0.28 },
    denim:    { label: "Denim",    roughness: 0.82, metalness: 0.00, baseColor: "#2a4075", sheen: 0.08, sheenRoughness: 0.60, sheenColor: "#4060a0", clearcoat: 0.00, clearcoatRoughness: 0.60, envIntensity: 0.35 },
    chiffon:  { label: "Chiffon",  roughness: 0.38, metalness: 0.00, baseColor: "#f4f0ed", sheen: 0.40, sheenRoughness: 0.28, sheenColor: "#f0eae0", clearcoat: 0.05, clearcoatRoughness: 0.40, envIntensity: 0.50 },
    wool:     { label: "Wool",     roughness: 0.90, metalness: 0.00, baseColor: "#d4c6b1", sheen: 0.25, sheenRoughness: 0.75, sheenColor: "#c8b898", clearcoat: 0.00, clearcoatRoughness: 0.80, envIntensity: 0.28 },
    linen:    { label: "Linen",    roughness: 0.82, metalness: 0.00, baseColor: "#ebe2d5", sheen: 0.06, sheenRoughness: 0.60, sheenColor: "#e0d0b8", clearcoat: 0.00, clearcoatRoughness: 0.60, envIntensity: 0.35 },
    leather:  { label: "Leather",  roughness: 0.45, metalness: 0.00, baseColor: "#3b2a1a", sheen: 0.08, sheenRoughness: 0.42, sheenColor: "#4a3520", clearcoat: 0.28, clearcoatRoughness: 0.40, envIntensity: 0.52 },
    suede:    { label: "Suede",    roughness: 0.93, metalness: 0.00, baseColor: "#8b6b52", sheen: 0.30, sheenRoughness: 0.72, sheenColor: "#a08060", clearcoat: 0.00, clearcoatRoughness: 0.80, envIntensity: 0.28 },
    organza:  { label: "Organza",  roughness: 0.22, metalness: 0.00, baseColor: "#f8f4f0", sheen: 0.65, sheenRoughness: 0.16, sheenColor: "#ede8e0", clearcoat: 0.12, clearcoatRoughness: 0.30, envIntensity: 0.62 },
    tweed:    { label: "Tweed",    roughness: 0.90, metalness: 0.00, baseColor: "#8b7355", sheen: 0.10, sheenRoughness: 0.68, sheenColor: "#968060", clearcoat: 0.00, clearcoatRoughness: 0.80, envIntensity: 0.30 },
    cashmere: { label: "Cashmere", roughness: 0.85, metalness: 0.00, baseColor: "#e8ddd0", sheen: 0.42, sheenRoughness: 0.68, sheenColor: "#d8ccc0", clearcoat: 0.00, clearcoatRoughness: 0.80, envIntensity: 0.32 },
    corduroy: { label: "Corduroy", roughness: 0.78, metalness: 0.00, baseColor: "#5c3d2e", sheen: 0.18, sheenRoughness: 0.52, sheenColor: "#6b4a38", clearcoat: 0.00, clearcoatRoughness: 0.65, envIntensity: 0.36 },
    metallic: { label: "Metallic", roughness: 0.10, metalness: 0.82, baseColor: "#c0c0c0", sheen: 0.22, sheenRoughness: 0.12, sheenColor: "#d8d8ff", clearcoat: 0.45, clearcoatRoughness: 0.12, envIntensity: 0.88 },
    sequin:   { label: "Sequin",   roughness: 0.04, metalness: 0.92, baseColor: "#d0d0d0", sheen: 0.55, sheenRoughness: 0.04, sheenColor: "#ffe0ff", clearcoat: 0.80, clearcoatRoughness: 0.04, envIntensity: 1.00 },
  } as const,
  debug: {
    verbose: true,
    showTilingOverlay: false,
  } as const,
  tiers: {
    none: {
      label: "Free",
      priceInr: 0,
      durationDays: 0,
      maxAccounts: 1,
      maxSaves: 0,
      dailyAllowance: 0,
      aiIncluded: false,
      maxShowroomDownloadsPerDay: 0,
      allowedModels: "ALL",
      allowedMaterials: "ALL",
      allowedBackgrounds: "ALL",
    },
    creator_1m: {
      label: "Creator",
      priceInr: 4000,
      durationDays: 30,
      maxAccounts: 1,
      maxSaves: 8,
      dailyAllowance: 20,
      aiIncluded: false,
      maxShowroomDownloadsPerDay: 3,
      allowedModels: "ALL",
      allowedMaterials: "ALL",
      allowedBackgrounds: "ALL",
    },
    studio_1m: {
      label: "Studio",
      priceInr: 16000,
      durationDays: 30,
      maxAccounts: 5,
      maxSaves: 100,
      dailyAllowance: 120,
      aiIncluded: true,
      maxShowroomDownloadsPerDay: 10,
      allowedModels: "ALL",
      allowedMaterials: "ALL",
      allowedBackgrounds: "ALL",
    },
    enterprise_1m: {
      label: "Enterprise",
      priceInr: 25000,
      durationDays: 30,
      maxAccounts: 12,
      maxSaves: 999999,
      dailyAllowance: 999,
      aiIncluded: true,
      maxShowroomDownloadsPerDay: 999,
      allowedModels: "ALL",
      allowedMaterials: "ALL",
      allowedBackgrounds: "ALL",
    },
  } as const,
} as const;

export type SubscriptionTierId = keyof typeof APP_DATA_0.tiers;
export type FabricPresetId = keyof typeof APP_DATA_0.fabricPresets;
export type CoinAction = keyof typeof APP_DATA_0.coinCosts;
export const FABRIC_PRESET_IDS = Object.keys(APP_DATA_0.fabricPresets) as FabricPresetId[];

export function getTier(id: string) {
  const normalizedId =
    id === "starter_4000" ? "creator_1m"
      : id === "studio_16000" ? "studio_1m"
      : id === "prod_24000" ? "enterprise_1m"
      : id;
  return APP_DATA_0.tiers[normalizedId as SubscriptionTierId] ?? APP_DATA_0.tiers.none;
}
