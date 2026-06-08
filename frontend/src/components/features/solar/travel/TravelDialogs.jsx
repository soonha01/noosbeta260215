import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import {
  CloseModalButton,
  Loader,
  ModalBody,
  ModalButtons,
  ModalCard,
  ModalGhostButton,
  ModalLayer,
  ModalPrimaryButton,
  ModalTitle,
  RatingButton,
  RatingRow,
} from './spaceTravel.styles';

export const AiObjetDialog = ({ stage, onChoose, onClose, accentColor }) => {
  return (
    <AnimatePresence mode="wait">
      {stage !== 'none' && (
        <ModalLayer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.46, ease: [0.16, 1, 0.3, 1] }}
        >
          <ModalCard
            $accent={accentColor}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.985 }}
            transition={{ duration: 0.44, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'grid', gap: '0.72rem', minHeight: '128px' }}
              >
                {stage === 'ask' && (
                  <>
                    <ModalTitle $accent={accentColor}>AI Objet를 보유중이신가요?</ModalTitle>
                    <ModalButtons>
                      <ModalPrimaryButton type="button" $accent={accentColor} onClick={() => onChoose('yes')}>
                        Yes
                      </ModalPrimaryButton>
                      <ModalGhostButton type="button" $accent={accentColor} onClick={() => onChoose('no')}>
                        No
                      </ModalGhostButton>
                    </ModalButtons>
                  </>
                )}

                {stage === 'connecting' && (
                  <>
                    <ModalTitle $accent={accentColor}>AI Objet를 연결중입니다.</ModalTitle>
                    <Loader $accent={accentColor} aria-hidden="true">
                      <span className="loader-core" />
                    </Loader>
                  </>
                )}

                {stage === 'success' && (
                  <>
                    <ModalTitle $accent={accentColor}>연결완료!</ModalTitle>
                    <ModalBody $accent={accentColor}>ai objet에 연결되었습니다.</ModalBody>
                  </>
                )}

                {stage === 'disconnecting' && (
                  <>
                    <ModalTitle $accent={accentColor}>연결을 종료중입니다..</ModalTitle>
                    <Loader $accent={accentColor} aria-hidden="true">
                      <span className="loader-core" />
                    </Loader>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {stage === 'ask' && (
                <CloseModalButton
                  as={motion.button}
                  type="button"
                  $accent={accentColor}
                  onClick={onClose}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24 }}
                >
                  <X size={14} />
                </CloseModalButton>
              )}
            </AnimatePresence>
          </ModalCard>
        </ModalLayer>
      )}
    </AnimatePresence>
  );
};

export const ExitDialog = ({ open, onSelect, onClose, accentColor }) => {
  return (
    <AnimatePresence>
      {open && (
        <ModalLayer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <ModalCard
            $accent={accentColor}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <ModalTitle $accent={accentColor}>우주 여행을 종료할까요?</ModalTitle>
            <ModalButtons>
              <ModalPrimaryButton type="button" $accent={accentColor} onClick={() => onSelect('planets')}>
                행성 선택으로 돌아가기
              </ModalPrimaryButton>
              <ModalGhostButton type="button" $accent={accentColor} onClick={() => onSelect('home')}>
                여행 종료하기
              </ModalGhostButton>
            </ModalButtons>
            <CloseModalButton type="button" $accent={accentColor} onClick={onClose}>
              <X size={14} />
            </CloseModalButton>
          </ModalCard>
        </ModalLayer>
      )}
    </AnimatePresence>
  );
};

export const FeedbackDialog = ({
  open,
  value,
  onChange,
  feedbackText,
  onFeedbackTextChange,
  parsedFeedback,
  isParsing,
  onPreviewParse,
  onSubmit,
  onClose,
  accentColor,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <ModalLayer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ModalCard
            $accent={accentColor}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <ModalTitle $accent={accentColor}>이번 세션이 실제로 어땠는지 남겨주세요.</ModalTitle>
            <ModalBody $accent={accentColor}>
              별점과 자연어 피드백을 함께 받으면 다음 음악/조명 생성에 직접 반영됩니다.
            </ModalBody>
            <RatingRow>
              {[1, 2, 3, 4, 5].map((score) => (
                <RatingButton
                  key={score}
                  type="button"
                  $active={value === score}
                  $accent={accentColor}
                  onClick={() => onChange(score)}
                >
                  {score}
                </RatingButton>
              ))}
            </RatingRow>
            <textarea
              value={feedbackText}
              onChange={(event) => onFeedbackTextChange(event.target.value)}
              placeholder="예: 조명이 조금 차갑고 음악이 살짝 긴장됐어요. 집중은 잘 됐는데 오래 듣기엔 피곤했습니다."
              style={{
                width: '100%',
                minHeight: 120,
                boxSizing: 'border-box',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.92)',
                padding: '0.9rem 0.95rem',
                resize: 'vertical',
                font: 'inherit',
                lineHeight: 1.6,
              }}
            />
            {parsedFeedback && (
              <div
                style={{
                  borderRadius: 18,
                  border: `1px solid ${accentColor || '#ffffff'}33`,
                  background: 'rgba(255,255,255,0.04)',
                  padding: '0.9rem',
                  display: 'grid',
                  gap: '0.45rem',
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span style={pillStyle(true, accentColor)}>
                    goal {Math.round(Number(parsedFeedback?.structured_feedback?.goal_match || parsedFeedback?.structuredFeedback?.goal_match || 0) * 100)}%
                  </span>
                  <span style={pillStyle(false, accentColor)}>
                    music {Math.round(Number(parsedFeedback?.structured_feedback?.music_fit || parsedFeedback?.structuredFeedback?.music_fit || 0) * 100)}%
                  </span>
                  <span style={pillStyle(false, accentColor)}>
                    lighting {Math.round(Number(parsedFeedback?.structured_feedback?.lighting_fit || parsedFeedback?.structuredFeedback?.lighting_fit || 0) * 100)}%
                  </span>
                </div>
                <ModalBody $accent={accentColor}>{parsedFeedback.summary || parsedFeedback.coach_note || 'AI 피드백 해석이 준비되었습니다.'}</ModalBody>
              </div>
            )}
            <ModalButtons>
              <ModalGhostButton type="button" $accent={accentColor} onClick={onPreviewParse} disabled={isParsing}>
                {isParsing ? '해석 중...' : 'AI 해석 미리보기'}
              </ModalGhostButton>
              <ModalPrimaryButton type="button" disabled={!value} $accent={accentColor} onClick={onSubmit}>
                피드백 저장 후 이동
              </ModalPrimaryButton>
              <ModalGhostButton type="button" $accent={accentColor} onClick={onClose}>
                취소
              </ModalGhostButton>
            </ModalButtons>
          </ModalCard>
        </ModalLayer>
      )}
    </AnimatePresence>
  );
};

export const LiveFeedbackDialog = ({
  open,
  value,
  onChange,
  onSubmit,
  onClose,
  accentColor,
  adaptiveMusicState,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <ModalLayer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          <ModalCard
            $accent={accentColor}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
          >
            <ModalTitle $accent={accentColor}>제품 개선을 위해 피드백을 부탁드려요.</ModalTitle>
            <ModalBody $accent={accentColor}>
              현재 플레이어 경험을 1점부터 5점까지 평가해 주세요.
              {adaptiveMusicState?.label ? ` 최근 조정: ${adaptiveMusicState.label}` : ''}
            </ModalBody>
            <RatingRow>
              {[1, 2, 3, 4, 5].map((score) => (
                <RatingButton
                  key={score}
                  type="button"
                  $active={value === score}
                  $accent={accentColor}
                  onClick={() => onChange(score)}
                >
                  {score}
                </RatingButton>
              ))}
            </RatingRow>
            <ModalButtons>
              <ModalPrimaryButton type="button" disabled={!value} $accent={accentColor} onClick={onSubmit}>
                피드백 저장
              </ModalPrimaryButton>
              <ModalGhostButton type="button" $accent={accentColor} onClick={onClose}>
                나중에
              </ModalGhostButton>
            </ModalButtons>
            <CloseModalButton type="button" $accent={accentColor} onClick={onClose}>
              <X size={14} />
            </CloseModalButton>
          </ModalCard>
        </ModalLayer>
      )}
    </AnimatePresence>
  );
};

const pillStyle = (isPrimary, accentColor) => ({
  minHeight: 28,
  padding: '0 0.72rem',
  borderRadius: 0,
  display: 'inline-flex',
  alignItems: 'center',
  background: isPrimary ? `${accentColor || '#ffffff'}18` : 'rgba(255,255,255,0.05)',
  border: isPrimary ? `1px solid ${accentColor || '#ffffff'}55` : `1px solid ${accentColor || '#ffffff'}22`,
  color: isPrimary ? accentColor || '#ffffff' : 'rgba(255,255,255,0.82)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
});
