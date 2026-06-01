---
name: Part chip bar with fabric quick-switch
description: How the part selector bar is structured and how to update per-part fabric without changing active part
---

## Pattern
Each chip is a compound element: a label button (selects part) + a fabric popover trigger button, wrapped in a flex container styled as one pill.

```tsx
<div className="flex items-center overflow-hidden rounded-full border ...">
  <button onClick={() => setActivePart(k)}>Label</button>
  <Popover>
    <PopoverTrigger asChild>
      <button>{FABRIC_ICONS[curFabric]}</button>
    </PopoverTrigger>
    <PopoverContent>
      {FABRIC_PRESET_IDS.map(id => <button onClick={() => updatePartState(k, { fabricPreset: id })} />)}
    </PopoverContent>
  </Popover>
</div>
```

**Why `updatePartState` not `updateActivePart`:** The user can change fabric on any part's chip without first clicking to select that part. `updatePartState(key, patch)` updates an arbitrary part key in `setPartStates`.

**FABRIC_ICONS map:** `{ cotton: "🪡", silk: "✨", satin: "💫", velvet: "🟣", denim: "🔵", chiffon: "🤍", wool: "🟤", linen: "🟡" }` — defined as a module-level constant before the component.
