import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Image as ImageIcon, Upload, X, Shirt, Wand2, Copy, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CoinCostBadge } from "@/components/fabrixa/CoinCostBadge";
import { useRunGated } from "@/lib/fabrixa/runGated";
import { generateImage, isAiConfigured } from "@/lib/fabrixa/ai";

interface GeneratedDesign {
  id: string;
  url: string;
  prompt: string;
  provider?: string;
}

interface AIStudioPanelProps {
  balance: number;
  onResult: (url: string, meta: any, action: "apply_3d" | "edit_2d") => void;
}

export function AIStudioPanel({ balance, onResult }: AIStudioPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedDesign[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const runGated = useRunGated();
  const aiConfigured = isAiConfigured();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !referenceImage) {
      toast.error("Please provide a prompt or upload a reference image.");
      return;
    }

    await runGated("GENERATE_PATTERN", async () => {
      setIsGenerating(true);
      try {
        const result = await generateImage({
          prompt: prompt.trim() || "Beautiful seamless textile pattern",
          task: "textToPattern",
          referenceImageDataUrl: referenceImage ?? undefined,
        });

        const newDesign: GeneratedDesign = {
          id: Date.now().toString(),
          url: result.dataUrl,
          prompt: prompt.trim() || "Image Variation",
          provider: result.provider,
        };

        setHistory((prev) => [newDesign, ...prev]);
        toast.success(
          result.provider === "demo"
            ? "Demo design generated (add a real AI API key for actual AI generation)"
            : "Design generated successfully!"
        );

        setPrompt("");
        setReferenceImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("[AI Studio] generation failed:", error);
        const msg = error instanceof Error ? error.message : String(error);
        toast.error(`Generation failed: ${msg.slice(0, 120)}`);
      } finally {
        setIsGenerating(false);
      }
    });
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 sm:p-6 lg:flex-row">
      {/* Left Column: Generation Controls */}
      <div className="flex w-full flex-col gap-4 lg:w-[400px] lg:shrink-0">
        <div>
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" /> AI Studio
          </h2>
          <p className="text-sm text-muted-foreground">
            Describe your pattern or upload an image to guide the AI.
          </p>
        </div>

        {!aiConfigured && (
          <div className="flex items-start gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-700 dark:text-yellow-400">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              No AI API key found — running in demo mode. Set{" "}
              <code className="rounded bg-black/10 px-1 font-mono">VITE_AI_API_KEY</code> in your
              environment to enable real AI generation.
            </span>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-panel/40 p-4 backdrop-blur-xl shadow-lg space-y-4">
          {/* Text Prompt */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prompt
            </Label>
            <Textarea
              placeholder="e.g., seamless floral pattern with gold and navy blue, hyper-realistic, intricate details..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  void handleGenerate();
                }
              }}
              className="min-h-[100px] resize-none bg-background/50 backdrop-blur-sm"
            />
            <p className="text-[10px] text-muted-foreground">Tip: Press Ctrl+Enter / ⌘+Enter to generate</p>
          </div>

          {/* Reference Image Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reference Image <span className="font-normal normal-case text-muted-foreground/60">(optional)</span>
            </Label>
            {referenceImage ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10">
                <img
                  src={referenceImage}
                  alt="Reference"
                  className="h-full w-full object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute right-2 top-2 h-7 w-7 rounded-full"
                  onClick={() => {
                    setReferenceImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-background/30 py-6 hover:bg-muted/50 transition"
              >
                <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Click to upload reference image</span>
                <span className="text-[10px] text-muted-foreground/60 mt-1">JPG, PNG, WebP · max 5 MB</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <Button
            className="w-full bg-gradient-to-r from-primary to-accent shadow-md hover:opacity-90"
            onClick={handleGenerate}
            disabled={isGenerating || (!prompt.trim() && !referenceImage)}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Generating…
              </span>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-4 w-4" />
                Generate Design
              </>
            )}
            <CoinCostBadge feature="GENERATE_PATTERN" />
          </Button>
        </div>

        {/* Prompt Suggestions */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick prompts
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {[
              "Ikat geometric with indigo and gold",
              "Watercolor florals, pastel spring palette",
              "Abstract batik, earthy brown tones",
              "Vintage paisley, jewel tones",
              "Minimal stripes, navy and white",
              "Kalamkari inspired floral folk art",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="rounded-full border border-white/10 bg-background/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Generation History Grid */}
      <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel/20 p-4 shadow-inner backdrop-blur-xl">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <ImageIcon className="h-4 w-4" /> Your Generations
          {history.length > 0 && (
            <span className="ml-auto rounded-full bg-primary/20 px-2 py-0.5 text-[10px] text-primary">
              {history.length}
            </span>
          )}
        </h3>

        {history.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center opacity-50">
            <ImageIcon className="mb-3 h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Generated designs will appear here.</p>
            <p className="mt-1 text-xs text-muted-foreground">Enter a prompt and click Generate.</p>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-2">
            <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 xl:grid-cols-3">
              {history.map((design) => (
                <div
                  key={design.id}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-background/50 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="aspect-square w-full overflow-hidden bg-muted">
                    <img
                      src={design.url}
                      alt={design.prompt}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  {design.provider && (
                    <div className="absolute left-2 top-2 rounded-full bg-black/50 px-1.5 py-0.5 text-[9px] text-white/80 backdrop-blur">
                      {design.provider}
                    </div>
                  )}
                  <div className="space-y-2 bg-panel/80 p-3 backdrop-blur-md">
                    <p
                      className="line-clamp-2 text-xs text-muted-foreground"
                      title={design.prompt}
                    >
                      "{design.prompt}"
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 flex-1 px-2 text-[10px]"
                        onClick={() => setReferenceImage(design.url)}
                        title="Use as reference image for next generation"
                      >
                        <Copy className="mr-1 h-3 w-3" /> Use as Ref
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 flex-1 bg-primary/20 px-2 text-[10px] text-primary hover:bg-primary/30"
                        onClick={() =>
                          onResult(
                            design.url,
                            { task: "pattern", prompt: design.prompt, model: design.provider ?? "ai" },
                            "apply_3d",
                          )
                        }
                      >
                        <Shirt className="mr-1 h-3 w-3" /> To 3D
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        className="h-8 flex-1 px-2 text-[10px]"
                        onClick={() =>
                          onResult(
                            design.url,
                            { task: "pattern", prompt: design.prompt, model: design.provider ?? "ai" },
                            "edit_2d",
                          )
                        }
                      >
                        <Wand2 className="mr-1 h-3 w-3" /> To 2D
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
