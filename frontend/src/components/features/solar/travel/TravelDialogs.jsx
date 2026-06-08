import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import styled from 'styled-components';
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

const FeedbackModalCard = styled(ModalCard)`
  width: min(94vw, 520px);
  max-height: min(88vh, 620px);
  overflow-y: auto;
`;

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
                    <ModalTitle $accent={accentColor}>AI Objet를 보유 중인가요?</ModalTitle>
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
                    <ModalTitle $accent={accentColor}>AI Objet에 연결 중입니다.</ModalTitle>
                    <Loader $accent={accentColor} aria-hidden="true">
                      <span className="loader-core" />
                    </Loader>
                  </>
                )}

                {stage === 'success' && (
                  <>
                    <ModalTitle $accent={accentColor}>연결 완료</ModalTitle>
                    <ModalBody $accent={accentColor}>AI Objet에 연결되었습니다.</ModalBody>
                  </>
                )}

                {stage === 'disconnecting' && (
                  <>
                    <ModalTitle $accent={accentColor}>연결을 종료 중입니다.</ModalTitle>
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
            <ModalTitle $accent={accentColor}>여정을 종료할까요?</ModalTitle>
            <ModalButtons>
              <ModalPrimaryButton type="button" $accent={accentColor} onClick={() => onSelect('planets')}>
                행성 선택으로 돌아가기
              </ModalPrimaryButton>
              <ModalGhostButton type="button" $accent={accentColor} onClick={() => onSelect('home')}>
                나의 여행기록으로 가기
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
          <FeedbackModalCard
            $accent={accentColor}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <ModalTitle $accent={accentColor}>이번 여정은 어땠나요?</ModalTitle>
            <ModalBody $accent={accentColor}>
              점수만 저장하고 Muse 연결을 종료한 뒤 나의 여행기록으로 이동합니다.
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
                점수 저장 후 이동
              </ModalPrimaryButton>
              <ModalGhostButton type="button" $accent={accentColor} onClick={onClose}>
                취소
              </ModalGhostButton>
            </ModalButtons>
          </FeedbackModalCard>
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
            <ModalTitle $accent={accentColor}>지금 음악 조정은 어땠나요?</ModalTitle>
            <ModalBody $accent={accentColor}>
              현재 플레이어 경험을 1점부터 5점까지 평가해주세요.
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
                점수 저장
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
