from __future__ import annotations

from functools import lru_cache
import json
import os
import platform
from pathlib import Path
import subprocess
import time
from typing import Any, Mapping
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class AceStepApiError(RuntimeError):
    """Raised when ACE-Step API returns an error or cannot be reached."""


DEFAULT_ACE_STEP_HOST = "127.0.0.1"
DEFAULT_ACE_STEP_PORT = 8011
DEFAULT_ACE_STEP_BASE_URL = f"http://{DEFAULT_ACE_STEP_HOST}:{DEFAULT_ACE_STEP_PORT}"
DEFAULT_ACE_STEP_HEALTHCHECK_URL = f"{DEFAULT_ACE_STEP_BASE_URL}/health"

@lru_cache(maxsize=1)
def get_vendor_repo_root() -> Path:
    return Path(__file__).resolve().parents[2] / "vendor" / "ACE-Step-1.5"


def env_bool(name: str, default: bool) -> bool:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    return raw_value.strip().lower() in {"1", "true", "yes", "on"}


def is_apple_silicon() -> bool:
    return platform.system() == "Darwin" and platform.machine() == "arm64"


def build_local_server_command(
    host: str = DEFAULT_ACE_STEP_HOST,
    port: int = DEFAULT_ACE_STEP_PORT,
    no_init: bool = True,
    download_source: str = "auto",
    init_llm: bool | None = None,
    lm_model_path: str | None = None,
) -> dict[str, Any]:
    repo_root = get_vendor_repo_root()
    env = os.environ.copy()
    env["ACESTEP_NO_INIT"] = "true" if no_init else "false"
    env.setdefault("ACESTEP_IDLE_UNLOAD_SEC", "300")
    env["TOKENIZERS_PARALLELISM"] = "false"
    if init_llm is not None:
        env["ACESTEP_INIT_LLM"] = "true" if init_llm else "false"
    if is_apple_silicon():
        env.setdefault("ACESTEP_LM_BACKEND", "mlx")
        env.setdefault("ACESTEP_OFFLOAD_TO_CPU", "false")
        env.setdefault("ACESTEP_OFFLOAD_DIT_TO_CPU", "false")
        env.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
    command = ["uv", "run", "acestep-api", "--host", host, "--port", str(port)]
    if download_source:
        command.extend(["--download-source", download_source])
    if lm_model_path:
        command.extend(["--lm-model-path", lm_model_path])
    if init_llm:
        command.append("--init-llm")
    return {"cwd": str(repo_root), "env": env, "command": command}


class AceStepClient:
    def __init__(self, base_url: str = DEFAULT_ACE_STEP_BASE_URL, api_key: str | None = None, timeout_sec: float = 60.0):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout_sec = timeout_sec

    def _request(
        self,
        method: str,
        path: str,
        payload: Mapping[str, Any] | None = None,
        timeout_sec: float | None = None,
    ) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        data = None
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")

        request = Request(url, data=data, headers=headers, method=method)
        try:
            with urlopen(request, timeout=timeout_sec or self.timeout_sec) as response:
                return json.loads(response.read().decode("utf-8"))
        except HTTPError as error:
            message = error.read().decode("utf-8", errors="replace")
            raise AceStepApiError(f"ACE-Step HTTP {error.code}: {message}") from error
        except URLError as error:
            raise AceStepApiError(f"ACE-Step request failed: {error.reason}") from error

    def health(self) -> dict[str, Any]:
        return self._request("GET", "/health")

    def list_models(self) -> dict[str, Any]:
        return self._request("GET", "/v1/models")

    def init_model(
        self,
        model: str | None = None,
        *,
        slot: int = 1,
        init_llm: bool = False,
        lm_model_path: str | None = None,
        timeout_sec: float | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {"slot": slot, "init_llm": init_llm}
        if model:
            payload["model"] = model
        if lm_model_path:
            payload["lm_model_path"] = lm_model_path
        return self._request("POST", "/v1/init", payload, timeout_sec=timeout_sec)

    def release_task(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        return self._request("POST", "/release_task", payload)

    def query_result(self, task_ids: list[str]) -> dict[str, Any]:
        return self._request("POST", "/query_result", {"task_id_list": task_ids})

    @staticmethod
    def parse_result_entries(task_result: Mapping[str, Any]) -> list[dict[str, Any]]:
        raw_result = task_result.get("result")
        if isinstance(raw_result, str) and raw_result:
            try:
                parsed = json.loads(raw_result)
            except json.JSONDecodeError as error:
                raise AceStepApiError(f"ACE-Step returned invalid result JSON: {raw_result}") from error
            if isinstance(parsed, list):
                return [item for item in parsed if isinstance(item, dict)]
        return []

    def wait_for_task(self, task_id: str, poll_interval_sec: float = 2.0, timeout_sec: float = 900.0) -> dict[str, Any]:
        deadline = time.time() + timeout_sec
        while time.time() < deadline:
            response = self.query_result([task_id])
            data = response.get("data") or []
            if data:
                result = data[0]
                status = result.get("status")
                if status == 1:
                    return result
                if status == 2:
                    raise AceStepApiError(f"ACE-Step task failed: {result}")
            time.sleep(poll_interval_sec)
        raise AceStepApiError(f"ACE-Step task timed out after {timeout_sec} seconds")

    def generate(self, payload: Mapping[str, Any], poll_interval_sec: float = 2.0, timeout_sec: float = 900.0) -> dict[str, Any]:
        release = self.release_task(payload)
        task_id = (release.get("data") or {}).get("task_id")
        if not isinstance(task_id, str) or not task_id:
            raise AceStepApiError(f"ACE-Step did not return task_id: {release}")
        return self.wait_for_task(task_id, poll_interval_sec=poll_interval_sec, timeout_sec=timeout_sec)


def start_local_server(
    host: str = DEFAULT_ACE_STEP_HOST,
    port: int = DEFAULT_ACE_STEP_PORT,
    no_init: bool = True,
    download_source: str = "auto",
    init_llm: bool | None = None,
    lm_model_path: str | None = None,
) -> subprocess.Popen[str]:
    spec = build_local_server_command(
        host=host,
        port=port,
        no_init=no_init,
        download_source=download_source,
        init_llm=init_llm,
        lm_model_path=lm_model_path,
    )
    return subprocess.Popen(spec["command"], cwd=spec["cwd"], env=spec["env"], text=True)
