# NOOS Lighting Research Foundations

이 문서는 `recognition -> intervention` 파이프라인에서 사용하는 조명값의 근거를 정리한다.  
핵심 원칙은 다음 두 가지다.

- `색온도(CCT)`와 `조도(lx)`는 가능한 한 직접 연구 근거를 사용한다.
- `패턴`은 근거가 상대적으로 약하므로 `direct`와 `inferred`를 명시적으로 구분한다.

## Direct value anchors

1. [Does Bright Light Counteract the Post-lunch Dip in Subjective States and Cognitive Performance Among Undergraduate Students?](https://pubmed.ncbi.nlm.nih.gov/34164367/)
- `1000 lx / 6500 K` blue-enriched bright light가 `100 lx / 4000 K` normal indoor light보다 졸림, 부정 정서, 작업기억 저하를 완화했다.
- Mercury, Mars, Neptune의 각성·집중 계열 anchor로 사용한다.

2. [Effect of lighting illuminance and colour temperature on mental workload in an office setting](https://www.nature.com/articles/s41598-021-94795-0)
- `3000 K / 750 lx` 조합이 가장 낮은 mental workload를 보였다.
- 반대로 `6500 K`에서는 illuminance가 올라갈수록 response time이 짧아졌다.
- Saturn, Earth의 low-workload/long-session 조명 anchor와 Mercury/Mars의 cool-bright 보정 근거로 사용한다.

3. [Effect of Light Color Temperature on Human Concentration and Creativity](https://pubmed.ncbi.nlm.nih.gov/26098084/)
- `3000 K`는 creativity에 유리했고, `6000 K`는 concentration에 유리했다.
- Venus/Uranus의 warm-creative 계열과 Neptune/Mercury의 cool-focus 계열 분리를 위한 핵심 근거다.

4. [Effects of Color Temperature and Brightness on Electroencephalogram Alpha Activity in a Polychromatic Light-emitting Diode](https://pmc.ncbi.nlm.nih.gov/articles/PMC3897760/)
- 참여자들은 warm color temperature에서 더 relaxed하다고 응답했다.
- warm-low-light와 cool-high-light 조합이 mismatch 조합보다 더 pleasing하게 인식됐다.
- 회복/이완과 각성/집중 scene의 pairing 룰을 정할 때 사용한다.

5. [Effect of Color Temperature and Illuminance on Psychology, Physiology, and Productivity: An Experimental Study](https://www.mdpi.com/1685704)
- `3000 K`와 약 `590 lx`가 comfort/relaxation에 가장 유리했고, self-adjustment 후에는 약 `4200 K / 500 lx`가 선호되었다.
- Earth의 balanced scene, Venus의 creative-warm scene에 사용한다.

6. [Blue lighting accelerates post-stress relaxation: Results of a preliminary study](https://pmc.ncbi.nlm.nih.gov/articles/PMC5648169/)
- blue lighting은 white lighting보다 acute stress 이후 초기 relaxation을 더 빠르게 만들었다.
- 다만 이 이점은 주로 초반 `1-5분` 정도에서만 강했다.
- Pluto에서만 짧은 `decompress` phase로 제한적으로 사용한다.

## Pattern evidence

다이내믹 조명 패턴은 direct lighting literature가 충분하지 않다. 그래서 패턴은 아래처럼 제한적으로 쓴다.

1. [Integrating Breathing Techniques Into Psychotherapy to Improve HRV: Which Approach Is Best?](https://pubmed.ncbi.nlm.nih.gov/33658964/)
- 약 `6 breaths/min` paced breathing이 HRV 조절을 높였다.
- 이를 Pluto의 `resonance-breath` 패턴으로 변환하되, 문서와 payload에 `inferred`로 명시한다.

## Implementation rule

- `direct_values`
  - CCT, lux, brightness anchor는 논문값을 직접 반영
- `inferred`
  - ramp, bloom, wave, resonance-breath 같은 시간 패턴은 직접 lighting trial이 아니라 breathing/relaxation literature에서 추론

## Important limitation

- RGB fixture는 목표 색을 시각적으로는 잘 근사할 수 있지만, 실제 melanopic delivery는 fixture SPD에 따라 달라진다.
- 따라서 `RGB hex`는 device command용, `CCT/lx`는 calibration anchor용으로 함께 내려보내야 한다.
