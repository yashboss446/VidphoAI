"""Media analysis microservice.

Phase 1 stub: exposes only a health check. Phase 2 adds /scenes (PySceneDetect)
and /beats (librosa), called by the Node backend when audio/video assets are
uploaded, to support beat-snapping in the timeline and richer AI-planner context.
"""

from fastapi import FastAPI

app = FastAPI(title="Analysis Service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
