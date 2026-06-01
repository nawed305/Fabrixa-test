// AI image generation — Google AI Studio (Gemini) direct REST API, OpenAI fallback.
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
  const k = APP_DATA_0.ai.apiKey;
  return !!k && !k.startsWith("REPLACE_ME") && !/DUMMY/i.test(k);
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

async function generateViaGeminiApi(
  prompt: string,
  _task: string,
  referenceImageDataUrl?: string | null,
): Promise<GenerateResult> {
  const apiKey = APP_DATA_0.ai.apiKey;
  const model = APP_DATA_0.ai.models.imageGen;
  const endpoint = `${APP_DATA_0.ai.baseUrl}/models/${model}:generateContent?key=${apiKey}`;

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
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Gemini AI failed (${res.status}): ${text.slice(0, 300)}`);
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
      error?: { message: string; status?: string };
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
  const model = APP_DATA_0.ai.models[task];
  const size = opts.size ?? "1024x1024";
  const key = APP_DATA_0.ai.apiKey;
  const isDummy = !key || key.startsWith("REPLACE_ME") || /DUMMY/i.test(key);

  if (isDummy) {
    await new Promise((r) => setTimeout(r, 600));
    return {
      dataUrl: demoImageFromPrompt(opts.prompt),
      provider: "demo",
      model: "demo-swatch",
    };
  }

  if (APP_DATA_0.ai.provider === "gemini") {
    return generateViaGeminiApi(opts.prompt, task, opts.referenceImageDataUrl);
  }

  if (APP_DATA_0.ai.provider === "openai") {
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), APP_DATA_0.ai.timeoutMs);
    try {
      const res = await fetch(`${APP_DATA_0.ai.baseUrl}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${APP_DATA_0.ai.apiKey}`,
        },
        body: JSON.stringify({
          model,
          prompt: opts.prompt,
          n: 1,
          size,
          response_format: "b64_json",
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`AI failed (${res.status}): ${t.slice(0, 240)}`);
      }
      const json = (await res.json()) as {
        data?: Array<{ b64_json?: string; url?: string }>;
      };
      const first = json.data?.[0];
      if (first?.b64_json) {
        return {
          dataUrl: `data:image/png;base64,${first.b64_json}`,
          provider: "openai",
          model,
        };
      }
      if (first?.url) {
        const blob = await (await fetch(first.url)).blob();
        return {
          dataUrl: await blobToDataUrl(blob),
          provider: "openai",
          model,
        };
      }
      throw new Error("AI returned no image.");
    } finally {
      clearTimeout(tm);
    }
  }

  throw new Error(`Provider not implemented: ${APP_DATA_0.ai.provider}`);
}

function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(b);
  });
}
