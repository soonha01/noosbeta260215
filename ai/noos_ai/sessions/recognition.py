from __future__ import annotations

from typing import Any, Mapping

from ..common import as_mapping, clamp, now_utc_iso, round_float, safe_float
from ..contracts import RecognitionRequest
from ..eeg.bands import BAND_KEYS
from ..eeg.preprocessing import prepare_signal
from ..eeg.spectral import summarize_spectral_features
from ..research import DATASET_LIBRARY, STATE_REFERENCE_MAP, export_references
from .base import BaseSession, SessionError

STATE_AXES = (
    "focus_readiness",
    "stress_load",
    "fatigue_risk",
    "relaxation_level",
    "cortical_arousal",
    "mental_workload",
)
RAW_FEATURE_SOURCES = {"raw-readings", "hybrid-raw-survey"}


def _scale(value: float, low: float, high: float) -> float:
    if high <= low:
        return 0.0
    return clamp((value - low) / (high - low), 0.0, 1.0)


def _level(score: float) -> str:
    if score < 0.2:
        return "very_low"
    if score < 0.4:
        return "low"
    if score < 0.6:
        return "moderate"
    if score < 0.8:
        return "elevated"
    return "high"


def _is_raw_feature_source(feature_source: str) -> bool:
    return feature_source in RAW_FEATURE_SOURCES


def _hybrid_feature_source(base_feature_source: str, has_survey_context: bool) -> str:
    if not has_survey_context:
        return base_feature_source
    return "hybrid-raw-survey" if base_feature_source == "raw-readings" else "hybrid-summary-survey"


def _build_feature_snapshot(features: dict[str, Any]) -> dict[str, float]:
    global_relative = features["global_relative"]
    frontal_relative = features["regional_relative"]["frontal"]
    posterior_relative = features["regional_relative"]["posterior"]
    ratios = features["ratios"]

    snapshot = {
        "global_delta_relative": global_relative["delta"],
        "global_theta_relative": global_relative["theta"],
        "global_alpha_relative": global_relative["alpha"],
        "global_beta_relative": global_relative["beta"],
        "global_gamma_relative": global_relative["gamma"],
        "frontal_theta_relative": frontal_relative["theta"],
        "frontal_alpha_relative": frontal_relative["alpha"],
        "frontal_beta_relative": frontal_relative["beta"],
        "posterior_alpha_relative": posterior_relative["alpha"],
        "theta_beta_ratio": ratios["theta_beta_ratio"],
        "alpha_beta_ratio": ratios["alpha_beta_ratio"],
        "beta_alpha_ratio": ratios["beta_alpha_ratio"],
        "theta_alpha_ratio": ratios["theta_alpha_ratio"],
        "frontal_theta_beta_ratio": ratios["frontal_theta_beta_ratio"],
        "faa_alpha_log_ratio": ratios["faa_alpha_log_ratio"],
    }
    return {key: round_float(value) for key, value in snapshot.items()}


def _summary_to_features(relative_bands: dict[str, float]) -> dict[str, Any]:
    ratios = {
        "theta_beta_ratio": relative_bands["theta"] / relative_bands["beta"] if relative_bands["beta"] > 0 else 0.0,
        "alpha_beta_ratio": relative_bands["alpha"] / relative_bands["beta"] if relative_bands["beta"] > 0 else 0.0,
        "beta_alpha_ratio": relative_bands["beta"] / relative_bands["alpha"] if relative_bands["alpha"] > 0 else 0.0,
        "theta_alpha_ratio": relative_bands["theta"] / relative_bands["alpha"] if relative_bands["alpha"] > 0 else 0.0,
        "frontal_theta_beta_ratio": relative_bands["theta"] / relative_bands["beta"] if relative_bands["beta"] > 0 else 0.0,
        "faa_alpha_log_ratio": 0.0,
    }
    dominant_band = max(BAND_KEYS, key=lambda key: relative_bands[key])
    return {
        "per_channel": {},
        "global_absolute": relative_bands.copy(),
        "global_relative": relative_bands.copy(),
        "regional_relative": {
            "frontal": relative_bands.copy(),
            "posterior": relative_bands.copy(),
        },
        "ratios": ratios,
        "artifact_indicators": {
            "high_frequency_ratio": relative_bands["gamma"],
            "delta_ratio": relative_bands["delta"],
        },
        "dominant_band": dominant_band,
        "sample_rate_hz": None,
    }


def _compare_baseline(current: dict[str, float], baseline: dict[str, float] | None) -> dict[str, float]:
    if not baseline:
        return {}
    delta: dict[str, float] = {}
    for key, value in current.items():
        if key in baseline:
            delta[key] = round_float(value - baseline[key])
    return delta


def _confidence(
    base_strength: float,
    quality_score: float,
    feature_source: str,
    has_baseline: bool,
    high_frequency_ratio: float,
    dimension: str,
) -> float:
    confidence = base_strength * (0.55 + (0.45 * quality_score))
    confidence += 0.10 if _is_raw_feature_source(feature_source) else -0.08
    confidence += 0.06 if has_baseline else 0.0

    if not _is_raw_feature_source(feature_source) and dimension == "mental_workload":
        confidence -= 0.12

    if dimension in {"stress_load", "cortical_arousal"} and high_frequency_ratio > 0.12:
        confidence -= 0.12

    return clamp(confidence, 0.1, 0.95)


def _duration_eeg_weight(duration_sec: float | None) -> float:
    duration = duration_sec or 60.0
    if duration >= 3600:
        return 0.80
    if duration >= 1800:
        return 0.70
    if duration >= 600:
        return 0.55
    return 0.35


def _survey_scores(survey_context: Mapping[str, Any]) -> dict[str, float]:
    if not survey_context:
        return {}

    candidates = [
        as_mapping(survey_context.get("canonicalState")),
        as_mapping(survey_context.get("canonical_state")),
        as_mapping(as_mapping(survey_context.get("analysis")).get("canonicalState")),
        as_mapping(as_mapping(survey_context.get("analysis")).get("canonical_state")),
    ]

    for candidate in candidates:
        scores: dict[str, float] = {}
        for axis in STATE_AXES:
            value = safe_float(candidate.get(axis))
            if value is None:
                continue
            scores[axis] = clamp(value / 100.0 if value > 1.5 else value, 0.0, 1.0)
        if scores:
            return scores

    return {}


def _fusion_weights(request: RecognitionRequest, quality_score: float) -> dict[str, float]:
    duration_sec = safe_float(request.context.get("measurement_duration_sec"), 60.0) or 60.0
    duration_weight = _duration_eeg_weight(duration_sec)
    eeg_weight = clamp(duration_weight * (0.5 + (0.5 * quality_score)), 0.15, 0.85)
    survey_weight = 1.0 - eeg_weight

    return {
        "measurement_duration_sec": round_float(duration_sec, 3),
        "duration_weight": round_float(duration_weight, 3),
        "quality_adjusted_eeg_weight": round_float(eeg_weight, 3),
        "survey_weight": round_float(survey_weight, 3),
    }


def _fuse_dimensions(
    dimensions: dict[str, dict[str, Any]],
    survey_scores: dict[str, float],
    weights: dict[str, float],
) -> tuple[dict[str, dict[str, Any]], list[dict[str, Any]]]:
    eeg_weight = weights["quality_adjusted_eeg_weight"]
    survey_weight = weights["survey_weight"]
    fused: dict[str, dict[str, Any]] = {}
    conflict_flags: list[dict[str, Any]] = []

    for axis, payload in dimensions.items():
        survey_score = survey_scores.get(axis)
        if survey_score is None:
            fused[axis] = payload
            continue

        eeg_score = float(payload["score"])
        fused_score = clamp((eeg_score * eeg_weight) + (survey_score * survey_weight), 0.0, 1.0)
        confidence = clamp((float(payload["confidence"]) * eeg_weight) + (0.72 * survey_weight), 0.1, 0.95)
        evidence = dict(payload.get("evidence", {}))
        evidence.update(
            {
                "eeg_score": round_float(eeg_score, 4),
                "survey_score": round_float(survey_score, 4),
                "eeg_weight": round_float(eeg_weight, 4),
                "survey_weight": round_float(survey_weight, 4),
            }
        )

        if abs(eeg_score - survey_score) >= 0.35:
            conflict_flags.append(
                {
                    "axis": axis,
                    "eeg_score": round_float(eeg_score, 3),
                    "survey_score": round_float(survey_score, 3),
                    "delta": round_float(survey_score - eeg_score, 3),
                }
            )

        fused[axis] = {
            **payload,
            "score": round_float(fused_score, 3),
            "level": _level(fused_score),
            "confidence": round_float(confidence, 3),
            "rationale": f"{payload['rationale']} 설문 자기보고와 측정 시간 기반 가중치를 함께 반영했다.",
            "evidence": evidence,
        }

    return fused, conflict_flags


def _dimension_payload(
    key: str,
    score: float,
    confidence: float,
    evidence: dict[str, float],
    rationale: str,
) -> dict[str, Any]:
    return {
        "key": key,
        "score": round_float(score, 3),
        "level": _level(score),
        "confidence": round_float(confidence, 3),
        "rationale": rationale,
        "evidence": {name: round_float(value, 4) for name, value in evidence.items()},
        "references": list(STATE_REFERENCE_MAP[key]),
    }


def _infer_dimensions(
    features: dict[str, Any],
    quality_score: float,
    feature_source: str,
    has_baseline: bool,
) -> dict[str, dict[str, Any]]:
    global_relative = features["global_relative"]
    frontal_relative = features["regional_relative"]["frontal"]
    ratios = features["ratios"]
    artifact_indicators = features["artifact_indicators"]
    high_frequency_ratio = artifact_indicators["high_frequency_ratio"]

    workload_score = clamp(
        (0.55 * _scale(frontal_relative["theta"], 0.12, 0.24))
        + (0.15 * _scale(frontal_relative["beta"], 0.12, 0.24))
        + (0.15 * (1.0 - _scale(frontal_relative["alpha"], 0.18, 0.34)))
        + (0.15 * _scale(ratios["frontal_theta_beta_ratio"], 0.8, 1.8))
        - (0.10 * _scale(ratios["alpha_beta_ratio"], 1.8, 2.8)),
        0.0,
        1.0,
    )

    fatigue_score = clamp(
        (0.30 * _scale(global_relative["theta"], 0.14, 0.28))
        + (0.25 * _scale(global_relative["alpha"], 0.20, 0.40))
        + (0.25 * _scale(ratios["alpha_beta_ratio"], 1.2, 2.8))
        + (0.20 * (1.0 - _scale(global_relative["beta"], 0.14, 0.26)))
        - (0.10 * _scale(frontal_relative["beta"], 0.18, 0.28)),
        0.0,
        1.0,
    )

    stress_score = clamp(
        (0.40 * (1.0 - _scale(global_relative["alpha"], 0.18, 0.34)))
        + (0.30 * _scale(global_relative["beta"], 0.14, 0.28))
        + (0.20 * _scale(ratios["beta_alpha_ratio"], 0.7, 1.6))
        + (0.10 * _scale(frontal_relative["beta"], 0.14, 0.26)),
        0.0,
        1.0,
    )

    relaxation_score = clamp(
        (0.35 * _scale(global_relative["alpha"], 0.18, 0.40))
        + (0.30 * _scale(ratios["alpha_beta_ratio"], 1.1, 2.8))
        + (0.20 * (1.0 - _scale(global_relative["beta"], 0.14, 0.28)))
        + (0.15 * (1.0 - workload_score)),
        0.0,
        1.0,
    )

    cortical_arousal_score = clamp(
        (0.45 * _scale(global_relative["beta"], 0.14, 0.28))
        + (0.35 * (1.0 - _scale(global_relative["alpha"], 0.18, 0.38)))
        + (0.20 * (1.0 - _scale(global_relative["theta"], 0.12, 0.26))),
        0.0,
        1.0,
    )

    workload_distance = abs(workload_score - 0.45) / 0.45
    focus_readiness_score = clamp(
        (0.30 * (1.0 - fatigue_score))
        + (0.25 * (1.0 - stress_score))
        + (0.25 * (1.0 - clamp(workload_distance, 0.0, 1.0)))
        + (0.20 * quality_score),
        0.0,
        1.0,
    )

    return {
        "mental_workload": _dimension_payload(
            "mental_workload",
            workload_score,
            _confidence(0.86, quality_score, feature_source, has_baseline, high_frequency_ratio, "mental_workload"),
            {
                "frontal_theta_relative": frontal_relative["theta"],
                "frontal_alpha_relative": frontal_relative["alpha"],
                "frontal_theta_beta_ratio": ratios["frontal_theta_beta_ratio"],
            },
            "Frontal theta 상승과 frontal alpha 억제가 동시에 나타날수록 작업부하를 높게 본다.",
        ),
        "fatigue_risk": _dimension_payload(
            "fatigue_risk",
            fatigue_score,
            _confidence(0.81, quality_score, feature_source, has_baseline, high_frequency_ratio, "fatigue_risk"),
            {
                "global_theta_relative": global_relative["theta"],
                "global_alpha_relative": global_relative["alpha"],
                "alpha_beta_ratio": ratios["alpha_beta_ratio"],
            },
            "Theta와 alpha 부담이 beta 대비 커질수록 정신 피로 또는 졸림 위험을 높게 본다.",
        ),
        "stress_load": _dimension_payload(
            "stress_load",
            stress_score,
            _confidence(0.72, quality_score, feature_source, has_baseline, high_frequency_ratio, "stress_load"),
            {
                "global_alpha_relative": global_relative["alpha"],
                "global_beta_relative": global_relative["beta"],
                "beta_alpha_ratio": ratios["beta_alpha_ratio"],
            },
            "Alpha 저하와 beta 상승 조합을 스트레스 부하의 핵심 근거로 사용한다.",
        ),
        "relaxation_level": _dimension_payload(
            "relaxation_level",
            relaxation_score,
            _confidence(0.60, quality_score, feature_source, has_baseline, high_frequency_ratio, "relaxation_level"),
            {
                "global_alpha_relative": global_relative["alpha"],
                "alpha_beta_ratio": ratios["alpha_beta_ratio"],
                "global_beta_relative": global_relative["beta"],
            },
            "Alpha 우세와 낮은 beta는 이완 또는 회복 친화 상태로 해석한다.",
        ),
        "cortical_arousal": _dimension_payload(
            "cortical_arousal",
            cortical_arousal_score,
            _confidence(0.62, quality_score, feature_source, has_baseline, high_frequency_ratio, "cortical_arousal"),
            {
                "global_beta_relative": global_relative["beta"],
                "global_alpha_relative": global_relative["alpha"],
                "global_theta_relative": global_relative["theta"],
            },
            "Beta 대비 alpha·theta의 상대적 균형으로 각성 수준을 거칠게 추정한다.",
        ),
        "focus_readiness": _dimension_payload(
            "focus_readiness",
            focus_readiness_score,
            _confidence(0.55, quality_score, feature_source, has_baseline, high_frequency_ratio, "focus_readiness"),
            {
                "quality_score": quality_score,
                "mental_workload_score": workload_score,
                "fatigue_risk_score": fatigue_score,
                "stress_load_score": stress_score,
            },
            "집중 준비도는 단일 EEG 지표가 아니라 부하, 피로, 스트레스, 품질을 합친 복합 점수다.",
        ),
    }


def _dominant_state(dimensions: dict[str, dict[str, Any]]) -> tuple[str, str]:
    workload = dimensions["mental_workload"]["score"]
    fatigue = dimensions["fatigue_risk"]["score"]
    stress = dimensions["stress_load"]["score"]
    relaxation = dimensions["relaxation_level"]["score"]
    focus = dimensions["focus_readiness"]["score"]

    if fatigue >= 0.65 and relaxation >= 0.55:
        return "recovery_biased", "회복이 필요한 이완 우세 패턴"
    if stress >= 0.70:
        return "stress_loaded", "스트레스 부하 우세 패턴"
    if workload >= 0.60 and focus >= 0.55 and fatigue < 0.55:
        return "engaged_focus", "집중 진입 가능성이 있는 과제 몰입 패턴"
    if relaxation >= 0.65 and stress < 0.45:
        return "relaxed", "상대적으로 안정되고 이완된 패턴"
    if fatigue >= 0.65:
        return "fatigue_loaded", "피로 또는 졸림 위험이 두드러진 패턴"
    return "mixed_state", "단일 상태로 고정되지 않은 혼합 패턴"


def _limitations(
    request: RecognitionRequest,
    quality: dict[str, Any],
    feature_source: str,
    high_frequency_ratio: float,
) -> list[str]:
    limits = [
        "이 결과는 의료 진단이나 정신질환 판정이 아니라 상태 추정 리포트다.",
        "Muse 4채널(AF7/AF8/TP9/TP10)은 full-cap EEG보다 공간 정보가 적다.",
        "consumer-grade dry electrode 특성상 artifact와 세션 간 변동성이 더 크다.",
    ]

    if not _is_raw_feature_source(feature_source):
        limits.append("이번 결과는 원시 샘플이 아니라 밴드 요약값 기반이어서 신뢰도가 더 낮다.")

    if not request.baseline:
        limits.append("개인 기준선이 없어서 population prior 기반 해석만 수행했다.")

    if "eyes_state" not in request.context and "task_label" not in request.context:
        limits.append("eyes-open/closed 또는 task context가 없어서 resting/task 해석 경계가 넓다.")

    if quality["sample_count"] < 256:
        limits.append("샘플 길이가 짧아서 주파수 안정도가 낮다.")

    if high_frequency_ratio > 0.12:
        limits.append("고주파 비중이 높아 근전도(턱·이마 힘) 오염 가능성이 있다.")

    return limits


class RecognitionSession(BaseSession):
    session_type = "recognition"

    def analyze_mapping(self, payload: Mapping[str, Any]) -> dict[str, Any]:
        request = RecognitionRequest.from_mapping(payload)

        prepared = prepare_signal(request.readings, request.sample_rate_hz) if request.readings else None
        base_feature_source = "raw-readings" if prepared is not None else "band-summary"
        survey_scores = _survey_scores(request.survey_context)
        feature_source = _hybrid_feature_source(base_feature_source, bool(survey_scores))

        if prepared is not None:
            spectral_features = summarize_spectral_features(prepared.channel_series, prepared.sample_rate_hz)
            quality = prepared.quality
        elif request.band_summary is not None:
            spectral_features = _summary_to_features(request.band_summary.as_relative())
            quality = {
                "usable": True,
                "score": 0.55,
                "sample_count": request.band_summary.sample_count,
                "sample_rate_hz": request.sample_rate_hz,
                "warnings": ["Only band summary was provided; channel-level inference is limited."],
                "per_channel": {},
                "mean_outlier_ratio": 0.0,
                "mean_jump_ratio": 0.0,
                "mean_flatline_ratio": 0.0,
            }
        else:
            raise SessionError("recognition session requires either readings or band_summary.")

        snapshot = _build_feature_snapshot(spectral_features)
        baseline_delta = _compare_baseline(snapshot, request.baseline.features if request.baseline else None)
        dimensions = _infer_dimensions(
            spectral_features,
            quality_score=quality["score"],
            feature_source=base_feature_source,
            has_baseline=request.baseline is not None,
        )
        fusion = None
        if survey_scores:
            weights = _fusion_weights(request, quality["score"])
            dimensions, conflict_flags = _fuse_dimensions(dimensions, survey_scores, weights)
            fusion = {
                **weights,
                "survey_present": True,
                "survey_influence": "high"
                if weights["survey_weight"] >= 0.60
                else "moderate"
                if weights["survey_weight"] >= 0.35
                else "low",
                "conflict_flags": conflict_flags,
            }

        state_key, state_label = _dominant_state(dimensions)
        reference_ids: list[str] = []
        for dimension in dimensions.values():
            reference_ids.extend(dimension["references"])

        citations = export_references(reference_ids)
        high_frequency_ratio = spectral_features["artifact_indicators"]["high_frequency_ratio"]
        analyzed_at = now_utc_iso()

        result = {
            "session_type": self.session_type,
            "session_id": request.session_id,
            "analyzed_at": analyzed_at,
            "measured_at": request.measured_at,
            "session_partition": {
                "current": "recognition",
                "reserved_next": ["intervention", "adaptation", "longitudinal"],
            },
            "input_summary": {
                "device_type": request.device_type,
                "feature_source": feature_source,
                "raw_reading_count": len(request.readings),
                "survey_present": bool(survey_scores),
                "baseline_mode": "subject-baseline" if request.baseline else "population-prior",
                "context": request.context,
            },
            "quality": {
                "usable": quality["usable"],
                "score": round_float(quality["score"], 3),
                "sample_count": quality["sample_count"],
                "sample_rate_hz": round_float(quality["sample_rate_hz"], 3) if quality["sample_rate_hz"] else None,
                "warnings": list(quality["warnings"]),
                "mean_outlier_ratio": round_float(quality["mean_outlier_ratio"], 4),
                "mean_jump_ratio": round_float(quality["mean_jump_ratio"], 4),
                "mean_flatline_ratio": round_float(quality["mean_flatline_ratio"], 4),
            },
            "bands": {
                "global_relative": {
                    key: round_float(value, 4) for key, value in spectral_features["global_relative"].items()
                },
                "regional_relative": {
                    region: {key: round_float(value, 4) for key, value in values.items()}
                    for region, values in spectral_features["regional_relative"].items()
                },
                "dominant_band": spectral_features["dominant_band"],
            },
            "features": {
                "snapshot": snapshot,
                "baseline_delta": baseline_delta,
                "artifact_indicators": {
                    key: round_float(value, 4) for key, value in spectral_features["artifact_indicators"].items()
                },
            },
            "state_profile": {
                "dominant_state": state_key,
                "label": state_label,
                "dimensions": dimensions,
                "fusion": fusion,
                "summary": [
                    f"dominant_state={state_key}",
                    f"mental_workload={dimensions['mental_workload']['level']}",
                    f"fatigue_risk={dimensions['fatigue_risk']['level']}",
                    f"stress_load={dimensions['stress_load']['level']}",
                ],
            },
            "reference_profile": {
                "generated_at": analyzed_at,
                "device_type": request.device_type,
                "session_type": "recognition",
                "features": snapshot,
            },
            "limitations": _limitations(request, quality, feature_source, high_frequency_ratio),
            "citations": citations,
            "future_training_datasets": list(DATASET_LIBRARY.values()),
        }

        return result
