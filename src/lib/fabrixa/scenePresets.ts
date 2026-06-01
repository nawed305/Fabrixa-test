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
    envBlur: 0.25,
    envIntensity: 1.8,
    ambient: 0.28,
    keyIntensity: 1.9,
    fillIntensity: 0.50,
    rimIntensity: 0.70,
    shadowOpacity: 0.65,
  },
  {
    id: "runway",
    label: "Runway",
    background: "radial-gradient(ellipse at 50% 15%, #3a1e52 0%, #08060e 100%)",
    envPreset: "warehouse",
    envBlur: 0.12,
    envIntensity: 1.3,
    ambient: 0.08,
    keyIntensity: 2.8,
    fillIntensity: 0.18,
    rimIntensity: 1.4,
    shadowOpacity: 0.90,
  },
  {
    id: "soft",
    label: "Soft Light",
    background: "linear-gradient(180deg, #fff9f4 0%, #fef2e4 100%)",
    envPreset: "apartment",
    envBlur: 0.45,
    envIntensity: 1.5,
    ambient: 0.50,
    keyIntensity: 1.10,
    fillIntensity: 0.60,
    rimIntensity: 0.40,
    shadowOpacity: 0.32,
  },
  {
    id: "transparent",
    label: "Transparent",
    background: "transparent",
    envPreset: "studio",
    envBlur: 0.30,
    envIntensity: 1.6,
    ambient: 0.38,
    keyIntensity: 1.7,
    fillIntensity: 0.45,
    rimIntensity: 0.55,
    shadowOpacity: 0.50,
  },
];
