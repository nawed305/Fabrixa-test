---
name: FabricEditor props contract
description: Props that FabricEditor requires and why they must be passed correctly
---

## Props interface
```typescript
interface Props {
  onChange: (dataUrl: string) => void;
  activePart: string;       // e.g. "kurti.body" — required for per-part persistence
  visible?: boolean;        // true when design view is active
}
```

**Why `activePart` is required:** Emit function writes canvas JSON to `fabrixa:canvas:${activePart}`. Without it, all parts share one key and switching parts destroys work.

**Why `visible` matters:** FabricEditor is always mounted (display:none when hidden) to preserve canvas state. When it becomes visible again, the ResizeObserver fires but clientWidth may still be 0 for one frame. The `visible` prop triggers a 60ms setTimeout fallback resize to ensure the canvas renders at the correct size.

**How to apply:** In FabrixaApp.tsx, always pass both:
```tsx
<FabricEditor onChange={setDesignUrl} activePart={activePart} visible={view === "design"} />
```
