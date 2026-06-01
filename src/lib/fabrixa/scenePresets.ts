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
    background: "linear-gradient(160deg, #f7f3fb 0%, #ede5f4 100%)",
    envPreset: "studio",
    envBlur: 0.35,
    envIntensity: 1.4,
    ambient: 0.35,
    keyIntensity: 1.6,
    fillIntensity: 0.45,
    rimIntensity: 0.55,
    shadowOpacity: 0.55,
  },
  {
    id: "runway",
    label: "Runway",
    background: "radial-gradient(ellipse at 50% 20%, #2e1e42 0%, #0a080f 100%)",
    envPreset: "warehouse",
    envBlur: 0.20,
    envIntensity: 1.0,
    ambient: 0.12,
    keyIntensity: 2.4,
    fillIntensity: 0.20,
    rimIntensity: 1.0,
    shadowOpacity: 0.80,
  },
  {
    id: "soft",
    label: "Soft Light",
    background: "linear-gradient(180deg, #fff9f2 0%, #fef0e0 100%)",
    envPreset: "apartment",
    envBlur: 0.55,
    envIntensity: 1.2,
    ambient: 0.55,
    keyIntensity: 0.95,
    fillIntensity: 0.55,
    rimIntensity: 0.30,
    shadowOpacity: 0.30,
  },
  {
    id: "transparent",
    label: "Transparent",
    background: "transparent",
    envPreset: "studio",
    envBlur: 0.35,
    envIntensity: 1.2,
    ambient: 0.45,
    keyIntensity: 1.5,
    fillIntensity: 0.40,
    rimIntensity: 0.45,
    shadowOpacity: 0.45,
  },
];
