from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Mapping


class SessionError(ValueError):
    """Raised when a session payload cannot be analyzed."""


class BaseSession(ABC):
    session_type: str

    @abstractmethod
    def analyze_mapping(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        raise NotImplementedError
