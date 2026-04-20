from __future__ import annotations

from typing import Any, Mapping

from .base import BaseSession, SessionError
from .intervention import InterventionSession
from .recognition import RecognitionSession


SESSION_REGISTRY: dict[str, BaseSession] = {
    "recognition": RecognitionSession(),
    "intervention": InterventionSession(),
}


def get_session(session_type: str) -> BaseSession:
    session = SESSION_REGISTRY.get(session_type)
    if session is None:
        raise SessionError(f"unsupported session_type: {session_type}")
    return session


def analyze_session(payload: Mapping[str, Any]) -> dict[str, Any]:
    session_type = payload.get("session_type") if isinstance(payload, Mapping) else None
    if not isinstance(session_type, str) or not session_type:
        session_type = "recognition"
    session = get_session(session_type)
    return session.analyze_mapping(payload)
