// 3D scene presets — lighting + background combos for the garment preview.

export type ScenePresetId = "studio" | "runway" | "soft" | "transparent";

export interface ScenePreset {
  id: ScenePresetId;
  label: string;
  /** CSS background (colour, gradient, or "transparent"). */
  background: string;
  envPreset: "studio" | "city" | "sunset" | "warehouse" | "apartment";
  /** Environment map blur (0 = sharp reflections, 1 = fully blurred / diffuse). */
  envBlur: number;
  /** How strongly the env-map affects material specular/diffuse. */
  envIntensity: number;
  ambient: number;
  keyIntensity: number;
  fillIntensity: number;
  rimIntensity: number;
  shadowOpacity: number;
}

export const SCENE_PRESETS: ScenePreset[] = [
  {
    id: "studio",
    label: "Studio",
    background: "linear-gradient(160deg, #f0eaf8 0%, #e4d8f0 100%)",
    envPreset: "studio",
    envBlur: 0.30,
    envIntensity: 0.85,
    ambient: 0.32,
    keyIntensity: 1.6,
    fillIntensity: 0.45,
    rimIntensity: 0.55,
    shadowOpacity: 0.55,
  },
  {
    id: "runway",
    label: "Runway",
    background: "radial-gradient(ellipse at 50% 15%, #3a1e52 0%, #08060e 100%)",
    envPreset: "warehouse",
    envBlur: 0.18,
    envIntensity: 0.70,
    ambient: 0.10,
    keyIntensity: 2.2,
    fillIntensity: 0.16,
    rimIntensity: 1.1,
    shadowOpacity: 0.88,
  },
  {
    id: "soft",
    label: "Soft Light",
    background: "linear-gradient(180deg, #fff9f4 0%, #fef2e4 100%)",
    envPreset: "apartment",
    envBlur: 0.50,
    envIntensity: 0.80,
    ambient: 0.48,
    keyIntensity: 0.90,
    fillIntensity: 0.55,
    rimIntensity: 0.32,
    shadowOpacity: 0.28,
  },
  {
    id: "transparent",
    label: "Transparent",
    background: "transparent",
    envPreset: "studio",
    envBlur: 0.35,
    envIntensity: 0.80,
    ambient: 0.38,
    keyIntensity: 1.4,
    fillIntensity: 0.40,
    rimIntensity: 0.45,
    shadowOpacity: 0.45,
  },
];
