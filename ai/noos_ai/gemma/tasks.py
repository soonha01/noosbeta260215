from __future__ import annotations

from copy import deepcopy
import json
from typing import Any, Callable, Mapping

from ..common import clamp, dedupe_preserve_order, round_float, safe_float
from ..intervention.planet_profiles import PLANET_PROFILES


SUPPORTED_TASKS = {
    "feedback-parse",
    "planet-recommendation",
    "state-explanation",
    "dashboard-summary",
    "session-coach",
    "device-troubleshoot",
}


PLANET_CATALOG = [
    {
        "slug": profile.slug,
        "title": profile.title,
        "goal_label": profile.goal_label,
        "category": profile.category,
        "user_description": profile.user_description,
    }
    for profile in PLANET_PROFILES.values()
]

PLANET_BY_SLUG = {item["slug"]: item for item in PLANET_CATALOG}


def _lower_text(payload: Mapping[str, Any], key: str) -> str:
    value = payload.get(key)
    return str(value or "").strip().lower()


def _float(value: Any, default: float) -> float:
    numeric = safe_float(value, default)
    return default if numeric is None else float(numeric)


def _int(value: Any, default: int) -> int:
    return int(round(_float(value, default)))


def _deep_merge(base: Any, override: Any) -> Any:
    if isinstance(base, dict) and isinstance(override, dict):
        merged = {key: deepcopy(value) for key, value in base.items()}
        for key, value in override.items():
            merged[key] = _deep_merge(base.get(key), value)
        return merged
    if override is None:
        return deepcopy(base)
    return deepcopy(override)


def _keyword_score(text: str, keywords: tuple[str, ...]) -> int:
    return sum(1 for keyword in keywords if keyword in text)


def _top_axes(payload: Mapping[str, Any]) -> dict[str, float]:
    current_state = payload.get("currentState") or payload.get("current_state") or {}
    if not isinstance(current_state, Mapping):
        return {}
    return {
        "focus_readiness": _float(current_state.get("focus_readiness"), 0.5),
        "stress_load": _float(current_state.get("stress_load"), 0.5),
        "fatigue_risk": _float(current_state.get("fatigue_risk"), 0.5),
        "relaxation_level": _float(current_state.get("relaxation_level"), 0.5),
        "cortical_arousal": _float(current_state.get("cortical_arousal"), 0.5),
        "mental_workload": _float(current_state.get("mental_workload"), 0.5),
    }


def fallback_feedback_parse(payload: Mapping[str, Any]) -> dict[str, Any]:
    text = _lower_text(payload, "feedbackText")
    rating = clamp(_float(payload.get("rating"), 3.0) / 5.0, 0.0, 1.0)

    too_cool = any(token in text for token in ("차갑", "blue", "cool"))
    too_warm = any(token in text for token in ("너무 따뜻", "warm", "붉", "노랗"))
    too_bright = any(token in text for token in ("너무 밝", "bright", "눈부"))
    too_dim = any(token in text for token in ("어둡", "dim"))
    too_tense = any(token in text for token in ("긴장", "쫓기", "날카", "부담"))
    too_busy = any(token in text for token in ("산만", "복잡", "너무 많", "busy"))
    too_slow = any(token in text for token in ("느리", "쳐지", "sleepy"))
    too_fast = any(token in text for token in ("빠르", "급하", "rush"))
    focus_helped = any(token in text for token in ("집중", "몰입", "도움"))
    relax_helped = any(token in text for token in ("편안", "차분", "안정", "이완"))
    fatigue_increased = any(token in text for token in ("피곤", "지침", "fatigue"))

    goal_match = clamp(rating + (0.06 if focus_helped or relax_helped else -0.04), 0.0, 1.0)
    music_fit = clamp(rating - (0.12 if too_tense or too_busy else 0.0) - (0.08 if too_fast or too_slow else 0.0), 0.0, 1.0)
    lighting_fit = clamp(rating - (0.14 if too_bright or too_dim or too_cool or too_warm else 0.0), 0.0, 1.0)

    preferred_planets: list[str] = []
    avoid_planets: list[str] = []
    if relax_helped and not too_slow:
        preferred_planets.extend(["earth", "neptune", "pluto"])
    if focus_helped and not too_tense:
        preferred_planets.extend(["earth", "neptune", "saturn"])
    if too_tense or too_fast:
        avoid_planets.extend(["mars"])
    if too_slow:
        avoid_planets.extend(["pluto"])

    summary_parts = []
    if too_tense:
        summary_parts.append("음악 긴장도를 낮추는 보정이 필요합니다.")
    if too_bright or too_cool:
        summary_parts.append("조명은 더 따뜻하고 덜 밝은 방향이 적합합니다.")
    if too_busy:
        summary_parts.append("질감과 리듬 밀도를 낮춰 산만함을 줄여야 합니다.")
    if focus_helped:
        summary_parts.append("집중 도움 효과는 유지하는 편이 좋습니다.")
    if relax_helped:
        summary_parts.append("이완 효과가 확인되어 안정 계열 세션과 궁합이 좋습니다.")
    if not summary_parts:
        summary_parts.append("현재 피드백은 전체 만족도는 보통이며 미세 조정이 필요한 상태입니다.")

    return {
        "summary": " ".join(summary_parts),
        "structured_feedback": {
            "goal_match": round_float(goal_match, 3),
            "music_fit": round_float(music_fit, 3),
            "lighting_fit": round_float(lighting_fit, 3),
            "music_flags": dedupe_preserve_order(
                [
                    flag
                    for flag, active in (
                        ("too_tense", too_tense),
                        ("too_busy", too_busy),
                        ("too_fast", too_fast),
                        ("too_slow", too_slow),
                    )
                    if active
                ]
            ),
            "lighting_flags": dedupe_preserve_order(
                [
                    flag
                    for flag, active in (
                        ("too_cool", too_cool),
                        ("too_warm", too_warm),
                        ("too_bright", too_bright),
                        ("too_dim", too_dim),
                    )
                    if active
                ]
            ),
            "state_effects": {
                "focus_helped": focus_helped,
                "relaxation_helped": relax_helped,
                "fatigue_increased": fatigue_increased,
            },
            "recommended_adjustments": {
                "music_adjustments": {
                    "tempo_delta": (-6 if too_fast else 4 if too_slow else 0),
                    "energy_delta": round_float((-0.12 if too_tense else 0.05 if too_slow else 0.0), 3),
                    "brightness_delta": round_float((-0.10 if too_tense else -0.06 if too_busy else 0.0), 3),
                    "density_delta": round_float((-0.12 if too_busy else 0.0), 3),
                    "tension_delta": round_float((-0.14 if too_tense else 0.0), 3),
                    "texture_delta": round_float((-0.08 if too_busy else 0.02 if focus_helped else 0.0), 3),
                },
                "lighting_adjustments": {
                    "cct_delta": (-260 if too_cool else 220 if too_warm else 0),
                    "brightness_delta": (-8 if too_bright else 6 if too_dim else 0),
                    "lux_delta": (-90 if too_bright else 70 if too_dim else 0),
                    "motion_delta": round_float((-0.06 if too_tense else -0.08 if too_busy else 0.0), 3),
                },
                "session_adjustments": {
                    "duration_delta_sec": (-120 if too_busy or fatigue_increased else 60 if focus_helped and rating >= 0.8 else 0),
                    "preferred_planets": dedupe_preserve_order(preferred_planets)[:3],
                    "avoid_planets": dedupe_preserve_order(avoid_planets)[:3],
                },
            },
            "confidence": round_float(0.56 + min(0.28, len(text.split()) * 0.01), 3),
        },
        "coach_note": "다음 세션에서는 현재 효과가 좋았던 축은 유지하고, 자극 과다로 지적된 요소만 먼저 줄이는 방식이 안전합니다.",
        "next_session_prompt": "조명 온도와 음악 긴장도를 한 단계 낮춘 상태로 동일 목표를 다시 시도해 보세요.",
    }


def _planet_score(slug: str, axes: Mapping[str, float], text: str) -> float:
    profile = PLANET_BY_SLUG[slug]
    score = 0.0

    if slug == "neptune":
        score += 1.4 * axes.get("focus_readiness", 0.5)
        score += 1.0 * (1.0 - axes.get("stress_load", 0.5))
        score += 1.3 * _keyword_score(text, ("코딩", "논문", "deep work", "분석", "몰입", "집중"))
    elif slug == "earth":
        score += 1.1 * (1.0 - axes.get("stress_load", 0.5))
        score += 0.9 * (1.0 - axes.get("fatigue_risk", 0.5))
        score += 1.0 * _keyword_score(text, ("루틴", "업무", "장시간", "steady", "balance", "균형"))
    elif slug == "saturn":
        score += 1.1 * axes.get("mental_workload", 0.5)
        score += 1.2 * _keyword_score(text, ("기획", "설계", "연구", "생각", "전략", "철학"))
    elif slug == "venus":
        score += 1.2 * axes.get("relaxation_level", 0.5)
        score += 1.3 * _keyword_score(text, ("글쓰기", "브랜딩", "감성", "디자인", "창의", "writing"))
    elif slug == "uranus":
        score += 1.2 * _keyword_score(text, ("새로운", "전환", "막힘", "아이디어", "실험", "brainstorm"))
        score += 0.6 * (1.0 - axes.get("relaxation_level", 0.5))
    elif slug == "mars":
        score += 1.3 * axes.get("cortical_arousal", 0.5)
        score += 1.4 * _keyword_score(text, ("실행", "결단", "바로", "action", "push", "deadline"))
    elif slug == "jupiter":
        score += 1.2 * _keyword_score(text, ("발표", "리더십", "결정", "큰 그림", "meeting", "presentation"))
        score += 0.8 * axes.get("focus_readiness", 0.5)
    elif slug == "mercury":
        score += 1.2 * _keyword_score(text, ("시작", "진입", "착수", "kickoff", "start"))
        score += 0.9 * axes.get("cortical_arousal", 0.5)
    elif slug == "pluto":
        score += 1.4 * axes.get("fatigue_risk", 0.5)
        score += 1.3 * _keyword_score(text, ("회복", "정리", "안정", "calm", "rest", "recover"))

    if axes.get("stress_load", 0.5) > 0.72 and slug in {"mars", "mercury"}:
        score -= 0.9
    if axes.get("fatigue_risk", 0.5) > 0.72 and slug in {"mars", "mercury"}:
        score -= 0.8

    return score


def fallback_planet_recommendation(payload: Mapping[str, Any]) -> dict[str, Any]:
    text = " ".join(
        filter(
            None,
            [
                str(payload.get("intentText") or ""),
                str(payload.get("desiredOutcome") or ""),
                str(payload.get("memoText") or ""),
            ],
        )
    ).lower()
    axes = _top_axes(payload)
    ranking = sorted(
        (
            (slug, _planet_score(slug, axes, text))
            for slug in PLANET_BY_SLUG
        ),
        key=lambda item: item[1],
        reverse=True,
    )
    recommended = ranking[0][0]
    alternates = [slug for slug, _ in ranking[1:3]]
    profile = PLANET_BY_SLUG[recommended]

    tags = dedupe_preserve_order(
        [
            tag
            for tag, active in (
                ("deep_work", any(token in text for token in ("코딩", "논문", "분석", "집중"))),
                ("creative", any(token in text for token in ("아이디어", "브랜딩", "디자인", "창의"))),
                ("recovery", any(token in text for token in ("회복", "피곤", "안정", "rest"))),
                ("execution", any(token in text for token in ("실행", "착수", "결단", "deadline"))),
            )
            if active
        ]
    )

    return {
        "recommended_planet": recommended,
        "confidence": round_float(0.62 + min(0.2, max(0.0, ranking[0][1] - ranking[1][1]) * 0.08), 3),
        "headline": f"{profile['title']}를 먼저 추천합니다.",
        "summary": f"{profile['goal_label']} 성향이 현재 상태와 작업 의도에 가장 잘 맞습니다.",
        "justification": [
            f"현재 상태 기준으로 {profile['goal_label']} 벡터와의 거리가 가장 짧습니다.",
            f"입력한 목적 문장과 가장 잘 맞는 카테고리는 {profile['category']}입니다.",
        ],
        "alternate_planets": alternates,
        "intent_tags": tags,
        "setup_steps": [
            "세션 시작 전 1문장으로 오늘 해야 할 일을 다시 고정합니다.",
            "세션 중 다른 앱 전환을 줄이고 하나의 작업만 유지합니다.",
        ],
        "avoid": [
            "현재 긴장도가 높다면 지나치게 공격적인 목표 상태로 바로 점프하지 않습니다.",
        ],
        "recommended_duration_sec": _int(payload.get("requestedDurationSec"), 900),
    }


def fallback_state_explanation(payload: Mapping[str, Any]) -> dict[str, Any]:
    axes = _top_axes(payload)
    title = str(payload.get("title") or payload.get("stateLabel") or "현재 상태")
    target_planet = str(payload.get("targetPlanet") or "").strip().lower()

    focus = axes.get("focus_readiness", 0.5)
    stress = axes.get("stress_load", 0.5)
    fatigue = axes.get("fatigue_risk", 0.5)
    relaxation = axes.get("relaxation_level", 0.5)

    if stress >= 0.7:
        headline = "긴장 신호가 높아 바로 강한 자극을 주기보다 안정화가 먼저 필요한 상태입니다."
    elif fatigue >= 0.7:
        headline = "피로 신호가 커서 회복 우선 접근이 안전한 상태입니다."
    elif focus >= 0.7:
        headline = "집중 준비도가 충분해 목표 상태로 비교적 부드럽게 들어갈 수 있습니다."
    else:
        headline = "중간 수준의 혼합 상태로, 과한 자극 없이 방향을 정해주는 개입이 적합합니다."

    why_now = []
    if focus >= 0.65:
        why_now.append("집중 준비도는 충분한 편입니다.")
    if stress >= 0.6:
        why_now.append("긴장 축이 올라가 있어 자극 강도는 보수적으로 가져가는 편이 좋습니다.")
    if fatigue >= 0.6:
        why_now.append("피로 축이 높아 세션 길이와 밀도는 다소 낮추는 편이 안전합니다.")
    if relaxation >= 0.6:
        why_now.append("이완 기반이 확보되어 차분한 몰입형 행성과 궁합이 좋습니다.")

    caution = "이 해석은 비의료적 상태 설명이며, 이번 세션의 품질과 자기보고 문맥에 따라 달라질 수 있습니다."
    if target_planet:
        caution = f"{target_planet.title() if target_planet in PLANET_BY_SLUG else target_planet} 목표를 선택했다면 변화 폭보다 안정적인 진입을 먼저 확인하세요."

    return {
        "headline": headline,
        "summary": f"{title} 기준으로 현재 상태의 주된 특징을 요약했습니다.",
        "why_now": why_now or ["현재 상태는 뚜렷한 단일 축보다 복합적인 특징을 보입니다."],
        "do_now": [
            "첫 3분은 변화량보다 안정감을 확인합니다.",
            "산만함이 올라가면 즉시 강도보다 구조를 단순화합니다.",
        ],
        "caution": caution,
        "confidence_note": "이 설명은 NOOS 상태 벡터와 최근 세션 문맥을 함께 반영한 비의료적 해석입니다.",
    }


def fallback_dashboard_summary(payload: Mapping[str, Any]) -> dict[str, Any]:
    feedback_history = payload.get("feedbackHistory") or []
    memo_text = str(payload.get("memoText") or "").strip()

    if not isinstance(feedback_history, list):
        feedback_history = []

    ratings = [safe_float(entry.get("rating"), 0.0) or 0.0 for entry in feedback_history if isinstance(entry, Mapping)]
    avg_rating = sum(ratings) / len(ratings) if ratings else 0.0
    planet_scores: dict[str, list[float]] = {}
    for entry in feedback_history:
        if not isinstance(entry, Mapping):
            continue
        planet = str(entry.get("planetSlug") or entry.get("planet") or "").lower()
        if not planet:
            continue
        planet_scores.setdefault(planet, []).append(safe_float(entry.get("rating"), 0.0) or 0.0)

    ordered_planets = sorted(
        (
            (planet, sum(scores) / len(scores))
            for planet, scores in planet_scores.items()
            if scores
        ),
        key=lambda item: item[1],
        reverse=True,
    )

    top_planets = [planet for planet, _ in ordered_planets[:3]]
    weak_planets = [planet for planet, _ in ordered_planets[-2:]] if len(ordered_planets) >= 2 else []
    memo_tags = dedupe_preserve_order(
        [
            tag
            for tag, active in (
                ("focus", any(token in memo_text.lower() for token in ("집중", "몰입", "focus"))),
                ("stress", any(token in memo_text.lower() for token in ("긴장", "불안", "stress"))),
                ("fatigue", any(token in memo_text.lower() for token in ("피곤", "졸림", "fatigue"))),
                ("creative", any(token in memo_text.lower() for token in ("아이디어", "디자인", "창의"))),
            )
            if active
        ]
    )

    return {
        "headline": "최근 세션 기록을 기반으로 개인화 경향을 정리했습니다.",
        "summary": (
            f"현재 저장된 세션 평균 만족도는 {avg_rating:.1f}/5.0입니다."
            if ratings
            else "아직 충분한 피드백 기록이 없어 초기 요약만 제공합니다."
        ),
        "wins": [
            "최근 높은 평가를 받은 행성 패턴은 다음 추천 우선순위에 반영됩니다."
        ] + ([f"상대적으로 안정적인 행성: {', '.join(top_planets)}"] if top_planets else []),
        "frictions": ([f"재검토가 필요한 행성: {', '.join(weak_planets)}"] if weak_planets else []) + [
            "피드백 텍스트가 더 구체적일수록 음악/조명 보정이 정밀해집니다."
        ],
        "memo_tags": memo_tags,
        "preferred_planets": top_planets,
        "adjustments": [
            "낮은 평가가 반복된 세션은 먼저 자극 강도와 밝기를 낮추는 방향으로 보정합니다.",
            "메모에 집중/피로 태그가 반복되면 세션 길이와 리듬 밀도를 함께 조정합니다.",
        ],
        "coach_note": "다음 세션 전에는 오늘의 목적을 한 문장으로 남기고, 종료 후에는 무엇이 과했는지 한 줄로 적는 것이 가장 큰 개선 폭을 만듭니다.",
    }


def fallback_session_coach(payload: Mapping[str, Any]) -> dict[str, Any]:
    recommendation = payload.get("recommendation") if isinstance(payload.get("recommendation"), Mapping) else {}
    planet = str(payload.get("planet") or recommendation.get("recommended_planet") or "earth").lower()
    profile = PLANET_BY_SLUG.get(planet, PLANET_BY_SLUG["earth"])
    intent_text = str(payload.get("intentText") or "").strip()
    duration = _int(payload.get("recommendedDurationSec") or recommendation.get("recommended_duration_sec"), 900)

    return {
        "session_prompt": f"{profile['title']} 세션은 {profile['goal_label']} 방향으로 현재 상태를 정렬합니다.",
        "focus_frame": intent_text or "오늘 해야 할 핵심 작업 하나를 세션 시작 전에 고정합니다.",
        "success_signal": "시작 5분 내 산만함이 줄고, 작업 대상에 주의가 머무는지 확인합니다.",
        "caution": "너무 많은 목표를 동시에 잡지 말고, 한 세션에는 하나의 방향만 유지합니다.",
        "recommended_duration_sec": duration,
        "setup_steps": [
            "브라우저 탭과 알림을 정리합니다.",
            "세션 중간 평가 기준을 한 줄로 정합니다.",
            "조명과 음악은 동일 목표를 향하도록 동시에 유지합니다.",
        ],
    }


def fallback_device_troubleshoot(payload: Mapping[str, Any]) -> dict[str, Any]:
    issue_text = _lower_text(payload, "issueText")
    stage = str(payload.get("stage") or "device-question")

    if any(token in issue_text for token in ("bluetooth", "블루투스", "pair", "페어", "검색")):
        issue_label = "Muse 연결/페어링 문제"
        probable_causes = [
            "브라우저의 Bluetooth 권한이 차단되어 있을 수 있습니다.",
            "Muse S Athena가 이미 다른 기기와 연결된 상태일 수 있습니다.",
        ]
        steps = [
            "macOS 블루투스와 브라우저 권한을 다시 확인합니다.",
            "Muse 전원을 껐다 켜고, 다른 앱과의 연결을 해제합니다.",
            "Chrome 계열 브라우저에서 다시 검색을 시도합니다.",
        ]
    elif any(token in issue_text for token in ("signal", "노이즈", "stream", "파형", "0")):
        issue_label = "신호 수집/스트리밍 문제"
        probable_causes = [
            "센서 접촉이 불안정하거나 전극이 건조할 수 있습니다.",
            "측정 시작 직후 아직 안정화가 끝나지 않았을 수 있습니다.",
        ]
        steps = [
            "센서 접촉부를 다시 맞추고 피부 접촉을 안정화합니다.",
            "머리 위치를 고정한 채 10~20초 더 기다립니다.",
            "파형이 계속 0에 가깝다면 연결을 다시 시작합니다.",
        ]
    else:
        issue_label = "일반 측정 흐름 문제"
        probable_causes = [
            f"현재 단계({stage})에서 권한/연결/동기화 중 하나가 지연되고 있을 수 있습니다.",
        ]
        steps = [
            "브라우저 탭을 새로고침하기 전에 먼저 연결 권한 상태를 확인합니다.",
            "다른 블루투스 연결을 줄이고 Muse만 다시 연결합니다.",
            "동일 문제가 반복되면 설문 모드로 임시 진행하고, 이후 장치 환경을 재점검합니다.",
        ]

    return {
        "issue_label": issue_label,
        "summary": "현재 입력 기준으로 가장 가능성이 높은 원인과 안전한 조치 순서를 정리했습니다.",
        "probable_causes": probable_causes,
        "steps": steps,
        "avoid": [
            "연결이 불안정한 상태에서 여러 번 빠르게 재시도하지 않습니다.",
            "신호가 나쁘다고 바로 상태 해석을 믿지 않습니다.",
        ],
        "escalate_if": "권한 확인과 재연결 후에도 동일 현상이 3회 이상 반복되면 장치 상태 또는 브라우저 호환성을 별도로 점검합니다.",
    }


FALLBACK_BUILDERS: dict[str, Callable[[Mapping[str, Any]], dict[str, Any]]] = {
    "feedback-parse": fallback_feedback_parse,
    "planet-recommendation": fallback_planet_recommendation,
    "state-explanation": fallback_state_explanation,
    "dashboard-summary": fallback_dashboard_summary,
    "session-coach": fallback_session_coach,
    "device-troubleshoot": fallback_device_troubleshoot,
}


TASK_INSTRUCTIONS = {
    "feedback-parse": "Parse the user's freeform NOOS feedback into structured music, lighting, and next-session adjustment signals.",
    "planet-recommendation": "Recommend the best NOOS planet given the user's current state and intent.",
    "state-explanation": "Explain the NOOS recognition result in non-medical Korean that is actionable and cautious.",
    "dashboard-summary": "Summarize recent NOOS sessions, feedback, and memo text into trend insights and next adjustments.",
    "session-coach": "Turn the chosen planet and user intent into a concise session brief and preparation checklist.",
    "device-troubleshoot": "Convert a device trouble description into likely causes and safe step-by-step fixes.",
}


def _truncate_text(value: Any, max_length: int = 160) -> str:
    text = str(value or "").strip()
    if len(text) <= max_length:
        return text
    return f"{text[: max(0, max_length - 3)]}..."


def _compact_object(value: Any, max_items: int = 6) -> Any:
    if not isinstance(value, Mapping):
        return value

    compacted: dict[str, Any] = {}
    for key, item in list(value.items())[:max_items]:
        if isinstance(item, str):
            compacted[key] = _truncate_text(item, 80)
        elif isinstance(item, list):
            compacted[key] = item[:4]
        elif isinstance(item, Mapping):
            compacted[key] = _compact_object(item, 4)
        else:
            compacted[key] = item
    return compacted


def _summarize_feedback_history(feedback_history: Any) -> list[dict[str, Any]]:
    if not isinstance(feedback_history, list):
        return []

    summarized: list[dict[str, Any]] = []
    for entry in feedback_history[-4:]:
        if not isinstance(entry, Mapping):
            continue
        summarized.append(
            {
                "planet": entry.get("planetSlug") or entry.get("planet") or "",
                "rating": entry.get("rating"),
                "summary": _truncate_text(
                    entry.get("summary") or entry.get("memo") or entry.get("feedbackText") or "",
                    80,
                ),
            }
        )
    return summarized


def _build_output_skeleton(value: Any) -> Any:
    if isinstance(value, list):
        return []
    if isinstance(value, Mapping):
        return {key: _build_output_skeleton(item) for key, item in value.items()}
    if isinstance(value, bool):
        return False
    if isinstance(value, (int, float)):
        return 0
    return ""


def _build_task_reference(task: str, payload: Mapping[str, Any]) -> dict[str, Any] | list[dict[str, Any]] | None:
    if task == "planet-recommendation":
        return [
            {
                "slug": item["slug"],
                "title": item["title"],
                "goal_label": item["goal_label"],
                "category": item["category"],
            }
            for item in PLANET_CATALOG
        ]

    if task in {"session-coach", "state-explanation"}:
        planet_slug = str(payload.get("targetPlanet") or payload.get("planet") or "").strip().lower()
        profile = PLANET_BY_SLUG.get(planet_slug)
        if not profile:
            return None
        return {
            "selected_planet": {
                "slug": profile["slug"],
                "title": profile["title"],
                "goal_label": profile["goal_label"],
                "category": profile["category"],
            }
        }

    return None


def _build_task_prompt_payload(task: str, payload: Mapping[str, Any]) -> dict[str, Any]:
    if task == "feedback-parse":
        return {
            "feedbackText": _truncate_text(payload.get("feedbackText"), 220),
            "rating": payload.get("rating"),
            "planet": payload.get("planet") or "",
            "targetState": payload.get("targetState") or "",
            "measuredState": payload.get("measuredState") or "",
            "measuredSource": payload.get("measuredSource") or "",
            "currentState": _top_axes(payload),
        }
    if task == "planet-recommendation":
        return {
            "intentText": _truncate_text(payload.get("intentText"), 180),
            "desiredOutcome": _truncate_text(payload.get("desiredOutcome"), 140),
            "memoText": _truncate_text(payload.get("memoText"), 180),
            "currentState": _top_axes(payload),
            "requestedDurationSec": payload.get("requestedDurationSec"),
            "feedbackHistory": _summarize_feedback_history(payload.get("feedbackHistory")),
        }
    if task == "state-explanation":
        return {
            "title": _truncate_text(payload.get("title"), 80),
            "stateLabel": _truncate_text(payload.get("stateLabel"), 80),
            "summary": _truncate_text(payload.get("summary"), 140),
            "currentState": _top_axes(payload),
            "targetPlanet": payload.get("targetPlanet") or "",
        }
    if task == "dashboard-summary":
        return {
            "currentState": _top_axes(payload),
            "memoText": _truncate_text(payload.get("memoText"), 180),
            "feedbackHistory": _summarize_feedback_history(payload.get("feedbackHistory")),
        }
    if task == "session-coach":
        return {
            "planet": payload.get("planet") or "",
            "intentText": _truncate_text(payload.get("intentText"), 180),
            "recommendedDurationSec": payload.get("recommendedDurationSec"),
            "recommendation": _compact_object(payload.get("recommendation"), 6),
        }
    if task == "device-troubleshoot":
        return {
            "issueText": _truncate_text(payload.get("issueText"), 220),
            "stage": payload.get("stage") or "",
            "browser": payload.get("browser") or "",
            "deviceType": payload.get("deviceType") or "",
        }
    return dict(_compact_object(payload, 8) or {})


def build_messages(task: str, payload: Mapping[str, Any]) -> list[dict[str, str]]:
    if task not in SUPPORTED_TASKS:
        raise ValueError(f"unsupported task: {task}")

    fallback = FALLBACK_BUILDERS[task](payload)
    compact_payload = _build_task_prompt_payload(task, payload)
    reference = _build_task_reference(task, payload)
    output_skeleton = _build_output_skeleton(fallback)
    system_prompt = (
        "You are NOOS Local Copilot running on Gemma 4 E4B-it. "
        "Return only one valid JSON object. "
        "Use Korean for explanation strings, keep planet ids as lowercase slugs, and do not mention diagnoses or medical claims. "
        "Preserve the same key structure as the provided output shape. "
        "Keep the response concise and grounded only in the provided data."
    )
    sections = [f"Task: {TASK_INSTRUCTIONS[task]}"]
    if reference is not None:
        sections.append(
            "Reference: "
            + json.dumps(reference, ensure_ascii=False, separators=(",", ":"))
        )
    sections.extend(
        [
            "Input payload: "
            + json.dumps(compact_payload, ensure_ascii=False, separators=(",", ":")),
            "Output shape: "
            + json.dumps(output_skeleton, ensure_ascii=False, separators=(",", ":")),
            "Return only JSON.",
        ]
    )
    user_prompt = "\n\n".join(sections)
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def normalize_output(task: str, payload: Mapping[str, Any], parsed: dict[str, Any] | None) -> dict[str, Any]:
    fallback = FALLBACK_BUILDERS[task](payload)
    if not isinstance(parsed, dict):
        return fallback
    return _deep_merge(fallback, parsed)
