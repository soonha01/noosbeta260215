from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class BandDefinition:
    key: str
    label: str
    low_hz: float
    high_hz: float


CHANNELS = ("TP9", "AF7", "AF8", "TP10")
FRONTAL_CHANNELS = ("AF7", "AF8")
POSTERIOR_CHANNELS = ("TP9", "TP10")

BANDS = (
    BandDefinition("delta", "Delta", 1.0, 4.0),
    BandDefinition("theta", "Theta", 4.0, 8.0),
    BandDefinition("alpha", "Alpha", 8.0, 13.0),
    BandDefinition("beta", "Beta", 13.0, 30.0),
    BandDefinition("gamma", "Gamma", 30.0, 45.0),
)

BAND_KEYS = tuple(band.key for band in BANDS)
