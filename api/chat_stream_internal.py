from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()

async def event_stream(request: Request):
    count = 0
    yield ": ready\n\n"  # Initial comment
    while True:
        if await request.is_disconnected():
            break
        count += 1
        yield f"data: {{\"tick\": {count}}}\n\n"
        await asyncio.sleep(1)

@app.get("/api/chat_stream_internal")
async def chat_stream_internal(request: Request, message: str = ""):
    return StreamingResponse(
        event_stream(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
