from __future__ import annotations

from hashlib import sha256
import json
import os
from pathlib import Path
import threading
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .runtime import DEFAULT_MODEL_ID, GemmaRuntime, cache_directory, extract_first_json_object
from .tasks import SUPPORTED_TASKS, build_messages, normalize_output


class TaskRequest(BaseModel):
    payload: dict[str, Any] = Field(default_factory=dict)


runtime = GemmaRuntime(DEFAULT_MODEL_ID)
app = FastAPI(title="NOOS Gemma Service", version="0.1.0")
warmup_lock = threading.Lock()
warmup_thread: threading.Thread | None = None
warmup_error: str | None = None


def _cache_path(task: str, payload: dict[str, Any]) -> Path:
    digest = sha256(
        json.dumps(
            {
                "task": task,
                "model_id": runtime.model_id,
                "payload": payload,
            },
            ensure_ascii=False,
            sort_keys=True,
        ).encode("utf-8")
    ).hexdigest()
    return cache_directory() / f"{task}-{digest}.json"


def _warmup_model() -> None:
    global warmup_error
    try:
        runtime.ensure_loaded()
        warmup_error = None
    except Exception as error:  # pragma: no cover - runtime dependent
        warmup_error = f"{type(error).__name__}: {error}"


def _maybe_start_warmup() -> bool:
    global warmup_thread

    with warmup_lock:
        if warmup_thread is not None and warmup_thread.is_alive():
            return True
        if runtime.health().ready:
            return False
        warmup_thread = threading.Thread(target=_warmup_model, daemon=True, name="noos-gemma-warmup")
        warmup_thread.start()
        return True


@app.get("/health")
def health() -> dict[str, Any]:
    status = runtime.health()
    return {
        "service": "noos-gemma",
        "model_id": status.model_id,
        "device": status.device,
        "ready": status.ready,
        "detail": status.detail,
        "warming": warmup_thread is not None and warmup_thread.is_alive(),
        "warmup_error": warmup_error,
        "supported_tasks": sorted(SUPPORTED_TASKS),
    }


@app.post("/tasks/{task_name}")
def run_task(task_name: str, request: TaskRequest) -> dict[str, Any]:
    if task_name not in SUPPORTED_TASKS:
        raise HTTPException(status_code=404, detail=f"Unsupported task: {task_name}")

    payload = dict(request.payload or {})
    cache_path = _cache_path(task_name, payload)
    if cache_path.exists():
        cached = json.loads(cache_path.read_text(encoding="utf-8"))
        cached["cached"] = True
        return cached

    status = runtime.health()
    if not status.ready:
        warming = _maybe_start_warmup()
        return {
            "task": task_name,
            "engine": runtime.model_id,
            "response_source": "warming_up",
            "output": normalize_output(task_name, payload, None),
            "cached": False,
            "error_detail": warmup_error or ("Gemma warmup started" if warming else status.detail),
        }

    force_fallback = str(os.getenv("NOOS_GEMMA_FORCE_FALLBACK", "")).strip().lower() in {"1", "true", "yes", "on"}
    if force_fallback:
        response = {
            "task": task_name,
            "engine": runtime.model_id,
            "response_source": "forced_fallback",
            "output": normalize_output(task_name, payload, None),
            "cached": False,
            "error_detail": "Gemma fallback mode is enabled via NOOS_GEMMA_FORCE_FALLBACK",
        }
        cache_path.write_text(json.dumps(response, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return response

    parsed: dict[str, Any] | None = None
    response_source = "fallback"
    error_detail = None

    try:
        raw_output = runtime.generate_json(build_messages(task_name, payload))
        parsed = extract_first_json_object(raw_output)
        response_source = "gemma-4-e4b-it"
    except Exception as error:  # pragma: no cover - runtime dependent
        error_detail = f"{type(error).__name__}: {error}"

    output = normalize_output(task_name, payload, parsed)
    response = {
        "task": task_name,
        "engine": runtime.model_id,
        "response_source": response_source,
        "output": output,
        "cached": False,
        "error_detail": error_detail,
    }
    cache_path.write_text(json.dumps(response, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return response
