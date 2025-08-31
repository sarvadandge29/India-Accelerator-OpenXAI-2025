import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { topic, words, tone, audience } = await req.json();

  const prompt = `Write a short article on the topic: ${topic}.
Target length: ${words} words.
Audience: ${audience}.
Tone: ${tone}.
Include: title, intro, 3-5 subheads, bullets, and a meta description.`;

  const ollamaRes = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.1",
      prompt,
      stream: true,
    }),
  });

  const stream = new ReadableStream({
    async start(controller) {
      const reader = ollamaRes.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              controller.enqueue(new TextEncoder().encode(parsed.response));
            }
          } catch {
            // ignore malformed lines
          }
        }
      }
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
