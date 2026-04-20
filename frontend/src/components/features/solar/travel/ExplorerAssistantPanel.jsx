import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Sparkles, X } from 'lucide-react';

const FloatingRoot = styled.div`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9000;

  @media (max-width: 900px) {
    right: 16px;
    bottom: 16px;
  }
`;

const Backdrop = styled(motion.button)`
  position: fixed;
  inset: 0;
  border: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(5px);
  cursor: pointer;
`;

const FabButton = styled(motion.button)`
  width: 64px;
  height: 64px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background:
    radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.18), transparent 34%),
    linear-gradient(180deg, rgba(14, 14, 14, 0.96), rgba(4, 4, 4, 0.98));
  color: #f6f8ff;
  display: grid;
  place-items: center;
  box-shadow:
    0 22px 44px rgba(0, 0, 0, 0.36),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }
`;

const FabGlow = styled.span`
  position: absolute;
  inset: -10px;
  border-radius: inherit;
  background: radial-gradient(circle, rgba(88, 145, 255, 0.2), transparent 66%);
  filter: blur(12px);
  pointer-events: none;
`;

const Panel = styled(motion.aside)`
  width: min(420px, calc(100vw - 32px));
  max-height: min(76vh, 720px);
  overflow: auto;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background:
    radial-gradient(circle at 18% 12%, rgba(79, 131, 226, 0.14), transparent 36%),
    linear-gradient(165deg, rgba(10, 10, 10, 0.97), rgba(4, 4, 4, 0.95));
  color: #f5f7ff;
  padding: 1rem;
  display: grid;
  gap: 0.85rem;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.46);

  @media (max-width: 900px) {
    width: min(420px, calc(100vw - 24px));
    max-height: min(82vh, 720px);
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  align-items: flex-start;
`;

const HeaderCopy = styled.div`
  display: grid;
  gap: 0.2rem;
`;

const Kicker = styled.p`
  margin: 0;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(207, 220, 246, 0.68);
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const Title = styled.h2`
  margin: 0;
  color: #ffffff;
  font-size: 28px;
  line-height: 1;
  letter-spacing: -0.05em;
  font-family: 'Freesentation Black', 'Cardinal Fruit', sans-serif;
`;

const CloseButton = styled.button`
  width: 34px;
  height: 34px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(245, 248, 255, 0.88);
  display: grid;
  place-items: center;
  cursor: pointer;
  flex-shrink: 0;
`;

const Body = styled.p`
  margin: 0;
  color: rgba(226, 236, 255, 0.82);
  font-size: 13px;
  line-height: 1.65;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 124px;
  box-sizing: border-box;
  resize: vertical;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.03);
  color: #f5f7ff;
  padding: 0.88rem 0.92rem;
  font: inherit;
  line-height: 1.6;

  &::placeholder {
    color: rgba(207, 220, 246, 0.42);
  }

  &:focus {
    outline: none;
    border-color: rgba(79, 131, 226, 0.72);
    box-shadow: 0 0 0 1px rgba(79, 131, 226, 0.3);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
`;

const Button = styled.button`
  min-height: 40px;
  padding: 0 0.92rem;
  border: 1px solid ${({ $primary }) => ($primary ? '#4f83e2' : 'rgba(255, 255, 255, 0.22)')};
  background: ${({ $primary }) => ($primary ? '#4f83e2' : 'rgba(255, 255, 255, 0.06)')};
  color: ${({ $primary }) => ($primary ? '#06111f' : '#f5f7ff')};
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
  cursor: pointer;
  transition: transform 0.18s ease, filter 0.18s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.06);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
    transform: none;
    filter: none;
  }
`;

const Card = styled.section`
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: ${({ $tint }) => $tint || 'rgba(255, 255, 255, 0.03)'};
  padding: 0.9rem;
  display: grid;
  gap: 0.42rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  color: #ffffff;
  font-size: 17px;
  line-height: 1.2;
  letter-spacing: -0.03em;
  font-family: 'Freesentation Bold', 'Cardinal Fruit', sans-serif;
`;

const Headline = styled.p`
  margin: 0;
  color: rgba(238, 243, 255, 0.9);
  font-size: 14px;
  line-height: 1.55;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.42rem;
`;

const Pill = styled.span`
  min-height: 26px;
  padding: 0 0.68rem;
  display: inline-flex;
  align-items: center;
  border: 1px solid ${({ $blue }) => ($blue ? 'rgba(79, 131, 226, 0.42)' : 'rgba(255, 255, 255, 0.16)')};
  background: ${({ $blue }) => ($blue ? 'rgba(79, 131, 226, 0.12)' : 'rgba(255, 255, 255, 0.04)')};
  color: ${({ $blue }) => ($blue ? '#8fb2f2' : 'rgba(232, 239, 252, 0.8)')};
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: 'Cardinal Fruit', 'SF Pro Bold', sans-serif;
`;

const BulletList = styled.ul`
  margin: 0;
  padding-left: 1rem;
  display: grid;
  gap: 0.28rem;
  color: rgba(223, 232, 248, 0.78);
  font-size: 12px;
  line-height: 1.55;
`;

const FinePrint = styled.p`
  margin: 0;
  color: rgba(184, 197, 224, 0.68);
  font-size: 11px;
  line-height: 1.5;
`;

const ExplorerAssistantPanel = ({
  intentText,
  onIntentChange,
  onAnalyze,
  isLoading,
  recommendation,
  coach,
  selectedPlanet,
  onApplyRecommendedPlanet,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const recommendationOutput = recommendation?.output || null;
  const coachOutput = coach?.output || null;
  const recommendedPlanet = recommendationOutput?.recommended_planet;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Backdrop
            type="button"
            aria-label="NOOS Copilot 닫기"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        )}
      </AnimatePresence>

      <FloatingRoot>
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <Panel
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.88, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, y: 0, scale: 1, transformOrigin: 'bottom right' }}
              exit={{ opacity: 0, y: 18, scale: 0.9, transformOrigin: 'bottom right' }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              <HeaderRow>
                <HeaderCopy>
                  <Kicker>NOOS Copilot</Kicker>
                  <Title>오늘 원하는 상태를 적어주세요.</Title>
                </HeaderCopy>

                <CloseButton type="button" onClick={() => setIsOpen(false)} aria-label="닫기">
                  <X size={16} />
                </CloseButton>
              </HeaderRow>

              <Body>
                현재 상태, 최근 피드백, 오늘의 목적을 함께 보고 가장 맞는 행성과 세션 가이드를 정리합니다.
              </Body>

              <TextArea
                value={intentText}
                onChange={(event) => onIntentChange(event.target.value)}
                placeholder="예: 지금 피곤한데 논문 정리를 2시간 해야 해. 너무 자극적이지 않으면서 깊게 몰입하고 싶어."
              />

              <ButtonRow>
                <Button type="button" $primary onClick={onAnalyze} disabled={isLoading || !intentText.trim()}>
                  {isLoading ? '분석 중...' : 'AI 추천 받기'}
                </Button>
                {recommendedPlanet && recommendedPlanet.toLowerCase() !== String(selectedPlanet || '').toLowerCase() && (
                  <Button type="button" onClick={() => onApplyRecommendedPlanet(recommendedPlanet)}>
                    추천 행성 적용
                  </Button>
                )}
              </ButtonRow>

              {recommendationOutput && (
                <Card>
                  <CardTitle>{recommendationOutput.headline || '추천 행성이 준비되었습니다.'}</CardTitle>
                  <Headline>{recommendationOutput.summary}</Headline>
                  <MetaRow>
                    <Pill $blue>{String(recommendationOutput.recommended_planet || '').toUpperCase()}</Pill>
                    <Pill>선택 중: {String(selectedPlanet || '').toUpperCase()}</Pill>
                    <Pill>신뢰도 {Math.round(Number(recommendationOutput.confidence || 0) * 100)}%</Pill>
                  </MetaRow>
                  {!!recommendationOutput.intent_tags?.length && (
                    <MetaRow>
                      {recommendationOutput.intent_tags.map((tag) => (
                        <Pill key={tag} $blue>
                          {tag}
                        </Pill>
                      ))}
                    </MetaRow>
                  )}
                  {!!recommendationOutput.justification?.length && (
                    <BulletList>
                      {recommendationOutput.justification.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </BulletList>
                  )}
                </Card>
              )}

              {coachOutput && (
                <Card $tint="rgba(79, 131, 226, 0.08)">
                  <CardTitle>세션 브리프</CardTitle>
                  <Headline>{coachOutput.session_prompt}</Headline>
                  <Body>{coachOutput.focus_frame}</Body>
                  {!!coachOutput.setup_steps?.length && (
                    <BulletList>
                      {coachOutput.setup_steps.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </BulletList>
                  )}
                  <FinePrint>{coachOutput.caution}</FinePrint>
                </Card>
              )}
            </Panel>
          ) : (
            <FabButton
              key="fab"
              type="button"
              aria-label="NOOS Copilot 열기"
              onClick={() => setIsOpen(true)}
              initial={{ opacity: 0, scale: 0.82, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.82, y: 12 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <FabGlow />
              {recommendationOutput || coachOutput ? <Sparkles size={22} /> : <Bot size={22} />}
            </FabButton>
          )}
        </AnimatePresence>
      </FloatingRoot>
    </>
  );
};

export default React.memo(ExplorerAssistantPanel);
