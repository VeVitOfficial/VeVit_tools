export const runtime = "nodejs";

export async function GET() {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  let ollamaStatus = "unknown";

  try {
    const res = await fetch(`${ollamaUrl}/api/tags`, { method: "GET" });
    ollamaStatus = res.ok ? "ok" : "error";
  } catch {
    ollamaStatus = "unreachable";
  }

  return Response.json({
    status: "ok",
    ollama: ollamaStatus,
    timestamp: new Date().toISOString(),
  });
}
