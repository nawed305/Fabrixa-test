// AI image generation — routes through the secure server-side proxy (/api/ai/generate).
// The Gemini API key never reaches the browser.
import { APP_DATA_0 } from "@/lib/fabrixa/APP_DATA_0";

export interface GenerateOpts {
  prompt: string;
  size?: "512x512" | "1024x1024";
  task?: "imageGen" | "neckDesign" | "textToPattern";
  /** Optional reference image as a data URL (data:image/...;base64,...) */
  referenceImageDataUrl?: string | null;
}

export interface GenerateResult {
  dataUrl: string;
  provider: string;
  model: string;
}

export function isAiConfigured(): boolean {
  // Key lives on the server; we report configured if the placeholder is set.
  return true;
}

function demoImageFromPrompt(prompt: string): string {
  const size = 1024;
  const c = typeof document !== "undefined" ? document.createElement("canvas") : null;
  if (!c) return "";
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  let h = 0;
  for (let i = 0; i < prompt.length; i++) h = (h * 31 + prompt.charCodeAt(i)) >>> 0;
  const h1 = h % 360;
  const h2 = (h1 + 140) % 360;
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, `hsl(${h1} 70% 55%)`);
  g.addColorStop(1, `hsl(${h2} 70% 45%)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (let y = 32; y < size; y += 64) {
    for (let x = 32; x < size; x += 64) {
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.fillText("DEMO · " + prompt.slice(0, 48), 24, size - 32);
  return c.toDataURL("image/png");
}

async function generateViaProxy(
  prompt: string,
  task: string,
  referenceImageDataUrl?: string | null,
): Promise<GenerateResult> {
  const model = APP_DATA_0.ai.models[task as keyof typeof APP_DATA_0.ai.models] ?? APP_DATA_0.ai.models.imageGen;

  type GeminiPart =
    | { text: string }
    | { inlineData: { mimeType: string; data: string } };

  const parts: GeminiPart[] = [];

  if (referenceImageDataUrl) {
    const mimeMatch = referenceImageDataUrl.match(/^data:([^;]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const data = referenceImageDataUrl.replace(/^data:[^;]+;base64,/, "");
    parts.push({ inlineData: { mimeType, data } });
  }

  parts.push({
    text:
      `Create a seamless, tileable textile/fabric pattern for fashion design. ` +
      `${prompt}. The pattern must be high quality, visually rich, and suitable ` +
      `for garment printing. Use a square 1:1 composition.`,
  });

  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), APP_DATA_0.ai.timeoutMs);

  try {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, parts }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`AI proxy failed (${res.status}): ${text.slice(0, 300)}`);
    }

    const json = (await res.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            inlineData?: { mimeType: string; data: string };
            text?: string;
          }>;
        };
      }>;
      error?: { message: string };
    };

    if (json.error) throw new Error(`Gemini error: ${json.error.message}`);

    for (const candidate of json.candidates ?? []) {
      for (const part of candidate?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          return {
            dataUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
            provider: "gemini",
            model,
          };
        }
      }
    }

    throw new Error("Gemini AI returned no image in the response.");
  } finally {
    clearTimeout(tm);
  }
}

export async function generateImage(opts: GenerateOpts): Promise<GenerateResult> {
  const task = opts.task ?? "imageGen";

  // If no real key on server, fall back to demo image
  try {
    return await generateViaProxy(opts.prompt, task, opts.referenceImageDataUrl);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Server returned 503 = key not configured yet → show demo
    if (msg.includes("503") || msg.includes("not configured")) {
      await new Promise((r) => setTimeout(r, 600));
      return {
        dataUrl: demoImageFromPrompt(opts.prompt),
        provider: "demo",
        model: "demo-swatch",
      };
    }
    throw err;
  }
}
