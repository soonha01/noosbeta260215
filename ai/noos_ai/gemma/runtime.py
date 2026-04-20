from __future__ import annotations

from dataclasses import dataclass
import json
import os
from pathlib import Path
import threading
from typing import Any


DEFAULT_MODEL_ID = os.getenv("NOOS_GEMMA_MODEL_ID", "google/gemma-4-E4B-it")


@dataclass(slots=True)
class RuntimeHealth:
    ready: bool
    model_id: str
    device: str
    detail: str


class GemmaRuntime:
    def __init__(self, model_id: str | None = None) -> None:
        self.model_id = model_id or DEFAULT_MODEL_ID
        self._tokenizer = None
        self._model = None
        self._device = "cpu"
        self._detail = "lazy"
        self._load_lock = threading.Lock()
        self._generate_lock = threading.Lock()

    @property
    def device(self) -> str:
        return self._device

    def health(self) -> RuntimeHealth:
        ready = self._tokenizer is not None and self._model is not None
        return RuntimeHealth(
            ready=ready,
            model_id=self.model_id,
            device=self._device,
            detail=self._detail,
        )

    def _resolve_device(self, torch_module: Any) -> str:
        requested = str(os.getenv("NOOS_GEMMA_DEVICE", "auto")).strip().lower()
        if requested and requested != "auto":
            return requested
        if getattr(torch_module.backends, "mps", None) and torch_module.backends.mps.is_available():
            return "mps"
        if torch_module.cuda.is_available():
            return "cuda"
        return "cpu"

    def ensure_loaded(self) -> None:
        if self._tokenizer is not None and self._model is not None:
            return

        with self._load_lock:
            if self._tokenizer is not None and self._model is not None:
                return

            try:
                import torch
                from transformers import AutoModelForCausalLM, AutoTokenizer
            except Exception as error:  # pragma: no cover - dependency missing path
                self._detail = f"dependency_error:{type(error).__name__}"
                raise RuntimeError(
                    "Gemma runtime dependencies are missing. Install transformers/accelerate/sentencepiece first."
                ) from error

            self._device = self._resolve_device(torch)
            self._detail = "loading"

            model_kwargs: dict[str, Any] = {
                "torch_dtype": "auto",
                "low_cpu_mem_usage": True,
            }
            if self._device == "cuda":
                model_kwargs["device_map"] = "auto"

            tokenizer = AutoTokenizer.from_pretrained(self.model_id)
            model = AutoModelForCausalLM.from_pretrained(self.model_id, **model_kwargs)

            if self._device != "cuda":
                model = model.to(self._device)

            model.eval()
            self._tokenizer = tokenizer
            self._model = model
            self._detail = "loaded"

    def generate_json(self, messages: list[dict[str, str]], *, max_new_tokens: int = 720) -> str:
        self.ensure_loaded()

        tokenizer = self._tokenizer
        model = self._model
        if tokenizer is None or model is None:
            raise RuntimeError("Gemma runtime is not initialized")

        import torch

        prompt = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
            enable_thinking=False,
        )
        inputs = tokenizer(prompt, return_tensors="pt")
        inputs = {key: value.to(self._device) for key, value in inputs.items()}
        input_len = inputs["input_ids"].shape[-1]

        generation_kwargs = {
            "max_new_tokens": max_new_tokens,
            "do_sample": False,
            "pad_token_id": tokenizer.eos_token_id,
        }

        with self._generate_lock, torch.inference_mode():
            outputs = model.generate(**inputs, **generation_kwargs)

        decoded = tokenizer.decode(outputs[0][input_len:], skip_special_tokens=False)
        return decoded


def extract_first_json_object(text: str) -> dict[str, Any]:
    stripped = text.strip()
    if not stripped:
        raise ValueError("empty model response")

    decoder = json.JSONDecoder()
    first_brace = stripped.find("{")
    if first_brace < 0:
        raise ValueError("no JSON object found in model response")

    candidate = stripped[first_brace:]
    payload, _ = decoder.raw_decode(candidate)
    if not isinstance(payload, dict):
        raise ValueError("top-level JSON is not an object")
    return payload


def cache_directory() -> Path:
    root = Path(__file__).resolve().parents[2] / "generated" / "gemma_cache"
    root.mkdir(parents=True, exist_ok=True)
    return root
