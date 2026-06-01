import { Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRenderQualityStore, type RenderQuality } from "@/lib/fabrixa/renderQualityStore";

const OPTIONS: { value: RenderQuality; icon: React.ReactNode; label: string; desc: string }[] = [
  {
    value: "performance",
    icon: <Zap className="h-4 w-4" />,
    label: "Performance",
    desc: "Fast rendering, no post-FX. Best for editing.",
  },
  {
    value: "realistic",
    icon: <Sparkles className="h-4 w-4" />,
    label: "Realistic",
    desc: "SSAO depth, bloom, SMAA AA. Best for previewing.",
  },
];

export function RenderQualityToggle() {
  const quality = useRenderQualityStore((s) => s.quality);
  const setQuality = useRenderQualityStore((s) => s.setQuality);

  const current = OPTIONS.find((o) => o.value === quality) ?? OPTIONS[0];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 border-white/10 bg-background/50 text-xs"
          title={`Render: ${current.label}`}
        >
          {current.icon}
          {current.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-52 p-2">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          3D Render Quality
        </p>
        <div className="flex flex-col gap-1">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setQuality(opt.value)}
              className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-left transition ${
                quality === opt.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted"
              }`}
            >
              <span
                className={`mt-0.5 shrink-0 ${quality === opt.value ? "text-primary" : "text-muted-foreground"}`}
              >
                {opt.icon}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-xs font-medium ${quality === opt.value ? "text-primary" : ""}`}
                >
                  {opt.label}
                </span>
                <span className="block text-[10px] leading-tight text-muted-foreground">
                  {opt.desc}
                </span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
