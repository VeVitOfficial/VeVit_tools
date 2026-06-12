export const runtime = "nodejs";

interface OllamaPayload {
  model: string;
  prompt: string;
  system?: string;
  stream?: boolean;
  images?: string[];
}

export async function POST(req: Request) {
  let payload: OllamaPayload;

  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt, system, model = "llama3.2", stream = false, images } = payload;

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Missing or invalid prompt" }, { status: 400 });
  }

  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

  const body: Record<string, unknown> = {
    model,
    prompt,
    stream,
  };

  if (system && typeof system === "string") {
    body.system = system;
  }

  if (images && Array.isArray(images)) {
    body.images = images;
  }

  try {
    const ollamaRes = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!ollamaRes.ok) {
      const text = await ollamaRes.text().catch(() => "Unknown error");
      return Response.json(
        { error: "Ollama returned an error", details: text },
        { status: 502 }
      );
    }

    if (!stream) {
      const data = await ollamaRes.json();
      return Response.json({
        text: data.response ?? "",
        done: data.done ?? true,
        model: data.model ?? model,
      });
    }

    // Streaming mode
    const reader = ollamaRes.body?.getReader();
    if (!reader) {
      return Response.json({ error: "No response body from Ollama" }, { status: 502 });
    }

    const streamOut = new ReadableStream({
      async start(controller) {
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        } finally {
          reader.releaseLock();
        }
      },
    });

    return new Response(streamOut, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      {
        error: "Ollama API unavailable",
        message: "AI služba je momentálně nedostupná. Ujistěte se, že Ollama běží na localhost:11434.",
        details: message,
      },
      { status: 503 }
    );
  }
}
