from __future__ import annotations

from dataclasses import dataclass

from .common import dedupe_preserve_order


@dataclass(frozen=True, slots=True)
class ResearchReference:
    ref_id: str
    title: str
    url: str
    category: str
    summary: str
    evidence_strength: float


REFERENCE_LIBRARY: dict[str, ResearchReference] = {
    "consumer_eeg_validation": ResearchReference(
        ref_id="consumer_eeg_validation",
        title="Comparison of Medical and Consumer Wireless EEG Systems for Use in Clinical Trials",
        url="https://pubmed.ncbi.nlm.nih.gov/28824402/",
        category="device-validation",
        summary=(
            "Muse 같은 consumer EEG는 기본 스펙트럼 측정은 가능하지만, 의료급 장비보다 "
            "artifact와 재검사 변동성이 크다."
        ),
        evidence_strength=0.62,
    ),
    "workload_meta_analysis": ResearchReference(
        ref_id="workload_meta_analysis",
        title="EEG power spectral measures of cognitive workload: A meta-analysis",
        url="https://pubmed.ncbi.nlm.nih.gov/35128686/",
        category="workload",
        summary=(
            "인지 작업부하와 가장 일관되게 연결되는 지표는 theta이며, 특히 frontal theta가 "
            "가장 민감한 스펙트럼 지표로 보고됐다."
        ),
        evidence_strength=0.86,
    ),
    "fatigue_meta_analysis": ResearchReference(
        ref_id="fatigue_meta_analysis",
        title="The influence of mental fatigue on brain activity: Evidence from a systematic review with meta-analyses",
        url="https://pubmed.ncbi.nlm.nih.gov/32108954/",
        category="fatigue",
        summary=(
            "정신 피로는 theta와 alpha 증가와 가장 자주 연결되며, beta 변화도 함께 검토된다."
        ),
        evidence_strength=0.81,
    ),
    "stress_meta_analysis": ResearchReference(
        ref_id="stress_meta_analysis",
        title="The neural correlates of psychosocial stress: A systematic review and meta-analysis of spectral analysis EEG studies",
        url="https://pubmed.ncbi.nlm.nih.gov/35573807/",
        category="stress",
        summary=(
            "심리사회적 스트레스 연구에서 alpha 감소와 beta 증가 경향이 비교적 일관되고, "
            "FAA 등 다른 지표는 더 불안정하다."
        ),
        evidence_strength=0.72,
    ),
    "frontal_alpha_asymmetry_review": ResearchReference(
        ref_id="frontal_alpha_asymmetry_review",
        title="Frontal EEG alpha asymmetry and emotion: From neural underpinnings and methodological considerations to psychopathology and social cognition",
        url="https://pubmed.ncbi.nlm.nih.gov/29243266/",
        category="asymmetry",
        summary=(
            "frontal alpha asymmetry는 정서 연구에서 널리 쓰이지만 측정 절차와 해석에 "
            "방법론적 주의가 필요하다."
        ),
        evidence_strength=0.44,
    ),
}


DATASET_LIBRARY = {
    "eegmat": {
        "name": "EEGMAT",
        "url": "https://www.physionet.org/content/eegmat/1.0.0/",
        "focus": "rest vs mental arithmetic, workload/arousal-like changes",
    },
    "seed_vig": {
        "name": "SEED-VIG",
        "url": "https://weilongzheng.github.io/datasets/seed-vig/",
        "focus": "vigilance and fatigue",
    },
    "deap": {
        "name": "DEAP",
        "url": "https://www.eecs.qmul.ac.uk/mmv/datasets/deap/download_split.html",
        "focus": "valence/arousal emotion labels",
    },
    "amigos": {
        "name": "AMIGOS",
        "url": "https://eecs.qmul.ac.uk/mmv/datasets/amigos/index.html",
        "focus": "affect, mood, personality, social context",
    },
}


STATE_REFERENCE_MAP = {
    "mental_workload": ("consumer_eeg_validation", "workload_meta_analysis"),
    "fatigue_risk": ("consumer_eeg_validation", "fatigue_meta_analysis"),
    "stress_load": ("consumer_eeg_validation", "stress_meta_analysis"),
    "relaxation_level": ("consumer_eeg_validation", "stress_meta_analysis", "fatigue_meta_analysis"),
    "cortical_arousal": ("consumer_eeg_validation", "stress_meta_analysis"),
    "focus_readiness": ("consumer_eeg_validation", "workload_meta_analysis", "fatigue_meta_analysis"),
}


def export_references(ref_ids: tuple[str, ...] | list[str]) -> list[dict[str, object]]:
    exported: list[dict[str, object]] = []

    for ref_id in dedupe_preserve_order(ref_ids):
        reference = REFERENCE_LIBRARY.get(ref_id)
        if reference is None:
            continue
        exported.append(
            {
                "id": reference.ref_id,
                "title": reference.title,
                "url": reference.url,
                "category": reference.category,
                "summary": reference.summary,
                "evidence_strength": round(reference.evidence_strength, 3),
            }
        )

    return exported
