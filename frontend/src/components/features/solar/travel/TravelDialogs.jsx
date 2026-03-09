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

export const FeedbackDialog = ({ open, value, onChange, onSubmit, onClose, accentColor }) => {
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
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <ModalTitle>이번 여행 만족도를 선택해주세요.</ModalTitle>
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
