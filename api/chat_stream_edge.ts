export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const msg = url.searchParams.get("message") || "";

  const host = req.headers.get("host");
  const target = `https://${host}/api/chat_stream_internal?message=${encodeURIComponent(msg)}`;

  const backendRes = await fetch(target);
  const reader = backendRes.body!.getReader();

  return new Response(new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    }
  }), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
