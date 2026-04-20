# NOOS Survey Foundations

## Goal

The NOOS survey is no longer framed as a generic mood check.
It is a short, state-oriented questionnaire designed to estimate the same six axes used by the NOOS recognition engine:

- `focus_readiness`
- `stress_load`
- `fatigue_risk`
- `relaxation_level`
- `cortical_arousal`
- `mental_workload`

## Selected validated blocks

### 1. STAI-6

Used for acute tension / worry / state-anxiety load.

- Source: Marteau, T. M., & Bekker, H. (1992). *The development of a six-item short-form of the state scale of the Spielberger State-Trait Anxiety Inventory (STAI).* [PubMed](https://pubmed.ncbi.nlm.nih.gov/1393159/)
- Supportive validity reference: Tluczek et al. (2009). *Support for the Reliability and Validity of a Six-Item State Anxiety Scale Derived From the State-Trait Anxiety Inventory.* [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC2776769/)

NOOS use:

- Direct anchor for `stress_load`
- Inverse contribution to `relaxation_level`
- Secondary contribution to `mental_workload`

### 2. PANAS-X Attentiveness / Serenity / Fatigue

Used because the expanded PANAS-X manual supports lower-order state affect scales with moment-oriented instructions.

- Source manual: Watson, D., & Clark, L. A. (1994/1999). *PANAS-X Manual.* [PDF](https://www2.psychology.uiowa.edu/faculty/watson/PANAS-X.pdf)
- Original PANAS background: Watson, Clark, & Tellegen (1988). *Development and Validation of Brief Measures of Positive and Negative Affect: The PANAS Scales.* [PDF](https://scienceofbehaviorchange.org/wp-content/uploads/2017/10/PANAS.Watson.1988.pdf)

The NOOS survey uses these PANAS-X lower-order blocks:

- `Attentiveness`: alert, attentive, concentrating, determined
- `Serenity`: calm, relaxed, at ease
- `Fatigue`: sleepy, tired, sluggish, drowsy

NOOS use:

- `Attentiveness` directly supports `focus_readiness` and `cortical_arousal`
- `Serenity` directly supports `relaxation_level` and inversely supports `stress_load`
- `Fatigue` directly supports `fatigue_risk`

### 3. Karolinska Sleepiness Scale (KSS)

Used for immediate subjective sleepiness / wakefulness.

- Validation against EEG and performance: Kaida et al. (2006). *Validation of the Karolinska sleepiness scale against performance and EEG variables.* [PDF mirror](https://fatiguemanagersnetwork.org/wp-content/uploads/Kaida-et-al.2006_Validation-of-the-Karolinska-Sleepiness-Scale.pdf)
- Korean validation: Kim et al. (2024). *Validation of the Karolinska Sleepiness Scale in Korean.* [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11372212/)

NOOS use:

- Direct anchor for `fatigue_risk`
- Direct anchor for `cortical_arousal`
- Secondary contribution to `focus_readiness`

### 4. Paas Mental Effort Rating

Used as a compact subjective workload / invested mental effort proxy.

- Source: Paas, F. G. W. C., Tuovinen, J. E., Tabbers, H., & Van Gerven, P. W. M. (2003). *Measurement as a changeable characteristic of instructional design.* (commonly cites the Paas scale lineage)
- Foundational measurement paper: Paas et al. (1994). *Measurement of Cognitive Load in Instructional Research.* [PDF](https://ris.utwente.nl/ws/files/248299579/Paas1994measurement.pdf)
- NASA workload background used as conceptual support only: [NASA TLX](https://www.nasa.gov/human-systems-integration-division/nasa-task-load-index-tlx/)

NOOS use:

- Primary anchor for `mental_workload`
- Secondary contribution to `stress_load`, `relaxation_level`, and `cortical_arousal`

## Direct vs inferred mapping

The survey-to-engine mapping is not one-to-one for every axis.

Directly anchored:

- `stress_load`: STAI-6 + Serenity inverse
- `fatigue_risk`: PANAS-X Fatigue + KSS
- `mental_workload`: Paas mental effort

Partly inferred:

- `focus_readiness`: Attentiveness + wakefulness + low stress + low overload
- `relaxation_level`: Serenity + low STAI + lower effort
- `cortical_arousal`: wakefulness + attentiveness + low fatigue + moderate effort

This means the NOOS survey is evidence-based and structured, but it is not a diagnostic clinical instrument and not a validated Korean normed battery for these six exact NOOS axes.

## Implementation note

The Korean wording in the product is a semantic adaptation of the original validated English item blocks so they can be used naturally in the current UI.
That preserves construct intent, but the exact Korean item set should still be treated as a product adaptation rather than a formally normed local standardization.
