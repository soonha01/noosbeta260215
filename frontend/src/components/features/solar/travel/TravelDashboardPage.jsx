import React from 'react';
import {
  DashBody,
  DashCard,
  DashHeadline,
  DashLabel,
  DashboardGrid,
  DashMeta,
  FeedbackItem,
  FeedbackList,
  MemoActions,
  MemoInput,
  MemoSaveButton,
  PanelBackButton,
  PanelHeader,
  PanelPage,
  PanelTitle,
} from './spaceTravel.styles';

const TravelDashboardPage = ({
  stateSnapshot,
  planetMedia,
  accentColor,
  feedbackAverage,
  feedbackHistory,
  memoText,
  onMemoChange,
  onSaveMemo,
  onBack,
}) => {
  return (
    <PanelPage>
      <PanelHeader>
        <PanelBackButton type="button" onClick={onBack} $accent={accentColor}>
          ← 플레이어로 돌아가기
        </PanelBackButton>
        <PanelTitle $accent={accentColor}>Dashboard</PanelTitle>
      </PanelHeader>

      <DashboardGrid>
        <DashCard $accent={accentColor}>
          <DashLabel $accent={accentColor}>현재 감정 상태</DashLabel>
          <DashHeadline $accent={accentColor}>{stateSnapshot?.title || '측정 정보 없음'}</DashHeadline>
          <DashBody>{stateSnapshot?.summary || '설문/디바이스 측정 데이터가 아직 없습니다.'}</DashBody>
          <DashMeta $accent={accentColor}>{stateSnapshot?.sourceLabel || '데이터 없음'}</DashMeta>
        </DashCard>

        <DashCard $accent={accentColor}>
          <DashLabel $accent={accentColor}>선택한 목표 상태</DashLabel>
          <img
            src={planetMedia.image}
            alt={`${planetMedia.title} thumbnail`}
            style={{
              width: '100%',
              height: '124px',
              objectFit: 'cover',
              border: `1px solid ${accentColor}66`,
              marginBottom: '0.2rem',
            }}
          />
          <DashHeadline $accent={accentColor}>{planetMedia.title}</DashHeadline>
          <DashBody>{planetMedia.moodTarget}</DashBody>
          <DashMeta $accent={accentColor}>{planetMedia.trackName}</DashMeta>
        </DashCard>

        <DashCard $accent={accentColor}>
          <DashLabel $accent={accentColor}>만족도 기록</DashLabel>
          <DashHeadline $accent={accentColor}>{feedbackAverage ? `${feedbackAverage} / 5.0` : '기록 없음'}</DashHeadline>
          <FeedbackList>
            {feedbackHistory.slice(0, 5).map((entry) => (
              <FeedbackItem key={entry.id} $accent={accentColor}>
                <span>{entry.planet}</span>
                <strong>{entry.rating}점</strong>
              </FeedbackItem>
            ))}
          </FeedbackList>
        </DashCard>

        <DashCard className="dash-note" $accent={accentColor}>
          <DashLabel $accent={accentColor}>메모장</DashLabel>
          <MemoInput
            value={memoText}
            onChange={(event) => onMemoChange(event.target.value)}
            placeholder="오늘의 집중 포인트, 감정 변화, 개선점 등을 기록하세요."
          />
          <MemoActions>
            <MemoSaveButton type="button" onClick={onSaveMemo} $accent={accentColor}>
              메모 저장
            </MemoSaveButton>
          </MemoActions>
        </DashCard>
      </DashboardGrid>
    </PanelPage>
  );
};

export default React.memo(TravelDashboardPage);
