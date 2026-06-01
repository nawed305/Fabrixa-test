import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type RenderQuality = "performance" | "realistic";

interface RenderQualityState {
  quality: RenderQuality;
  setQuality: (q: RenderQuality) => void;
}

export const useRenderQualityStore = create<RenderQualityState>()(
  persist(
    (set) => ({
      quality: "performance",
      setQuality: (quality) => set({ quality }),
    }),
    {
      name: "fabrixa:render-quality",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : (undefined as unknown as Storage),
      ),
    },
  ),
);
