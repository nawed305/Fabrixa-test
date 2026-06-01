// src/lib/fabrixa/APP_DATA_0.ts

export const APP_DATA_0 = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  },
  ai: {
    apiKey: import.meta.env.VITE_AI_API_KEY || "",
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
    rzp_key_id: import.meta.env.VITE_RZP_KEY_ID || "",
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
    dprCap: 1.5,
  } as const,
  fabricPresets: {
    cotton:  { label: "Cotton",  roughness: 0.80, metalness: 0.00, baseColor: "#ffffff", sheen: 0.0, sheenRoughness: 0.5, clearcoat: 0.0, envIntensity: 0.6 },
    silk:    { label: "Silk",    roughness: 0.20, metalness: 0.03, baseColor: "#f9f2ed", sheen: 0.8, sheenRoughness: 0.2, clearcoat: 0.1, envIntensity: 1.2 },
    satin:   { label: "Satin",   roughness: 0.18, metalness: 0.07, baseColor: "#f4e6d8", sheen: 0.9, sheenRoughness: 0.1, clearcoat: 0.2, envIntensity: 1.4 },
    velvet:  { label: "Velvet",  roughness: 0.92, metalness: 0.00, baseColor: "#4b1226", sheen: 1.0, sheenRoughness: 0.6, clearcoat: 0.0, envIntensity: 0.4 },
    denim:   { label: "Denim",   roughness: 0.78, metalness: 0.00, baseColor: "#2a4075", sheen: 0.0, sheenRoughness: 0.5, clearcoat: 0.0, envIntensity: 0.5 },
    chiffon: { label: "Chiffon", roughness: 0.40, metalness: 0.00, baseColor: "#f4f0ed", sheen: 0.3, sheenRoughness: 0.3, clearcoat: 0.0, envIntensity: 0.8 },
    wool:    { label: "Wool",    roughness: 0.85, metalness: 0.00, baseColor: "#d4c6b1", sheen: 0.2, sheenRoughness: 0.7, clearcoat: 0.0, envIntensity: 0.4 },
    linen:   { label: "Linen",   roughness: 0.78, metalness: 0.00, baseColor: "#ebe2d5", sheen: 0.0, sheenRoughness: 0.5, clearcoat: 0.0, envIntensity: 0.5 },
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
