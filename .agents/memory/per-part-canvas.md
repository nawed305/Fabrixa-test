---
name: Per-part canvas persistence
description: How FabricEditor saves/restores canvas JSON independently per garment part
---

## The rule
Each garment part gets its own Fabric.js canvas JSON stored under `fabrixa:canvas:${partKey}` in localStorage. The single mounted FabricEditor loads/saves the correct key based on `activePart` prop changes.

**Why:** A single global `fabrixa:autosave` key meant switching parts would overwrite the previous part's canvas content. Users would lose work when switching between Body, Sleeves, Collar, etc.

**How to apply:**
- `activePartRef` (useRef) tracks current part so `emit()` always writes to the right key without stale closures.
- `prevPartRef` tracks the prior part so the `useEffect([activePart])` can save old → load new.
- On init: reads `fabrixa:canvas:${activePart}` first, falls back to legacy `fabrixa:autosave` (migration).
- When new part has no saved JSON: clears canvas to blank (fresh part experience).
- The `visible` prop (boolean) triggers a 60ms deferred resize after the canvas div transitions from `display:none` back to `display:flex` — without this, canvas scales to 0px when hidden and never recovers.
