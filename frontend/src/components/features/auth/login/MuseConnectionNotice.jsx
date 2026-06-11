import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Activity, BluetoothConnected } from 'lucide-react';

const MUSE_NOTICE_POSITION_STORAGE_KEY = 'noos_muse_notice_position';
const MUSE_NOTICE_MARGIN_PX = 12;
const MUSE_NOTICE_DEFAULT_LEFT_PX = 22;
const MUSE_NOTICE_DEFAULT_TOP_PX = 22;
const MUSE_NOTICE_DEFAULT_TOP_WITH_BACK_PX = 106;

const MuseLiveNotice = styled.div`
  position: fixed;
  left: ${({ $position }) => `${$position.x}px`};
  top: ${({ $position }) => `${$position.y}px`};
  z-index: 13000;
  min-width: min(320px, calc(100vw - 2.7rem));
  max-width: min(380px, calc(100vw - 2.7rem));
  padding: 0.86rem 0.95rem;
  border-radius: 18px;
  border: 1px solid ${({ $connected }) => ($connected ? 'rgba(126, 255, 199, 0.42)' : 'rgba(255, 255, 255, 0.2)')};
  background:
    linear-gradient(135deg, rgba(0, 0, 0, 0.82), rgba(18, 22, 20, 0.72)),
    ${({ $connected }) => ($connected ? 'rgba(28, 226, 154, 0.08)' : 'rgba(255, 255, 255, 0.06)')};
  color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(18px) saturate(130%);
  display: grid;
  gap: 0.42rem;
  pointer-events: auto;
  cursor: ${({ $isDragging }) => ($isDragging ? 'grabbing' : 'grab')};
  touch-action: none;
  user-select: none;

  .muse-notice-main {
    display: flex;
    align-items: center;
    gap: 0.58rem;
    min-width: 0;
  }

  .muse-notice-icon {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: ${({ $connected }) => ($connected ? 'rgba(126, 255, 199, 0.16)' : 'rgba(255,255,255,0.1)')};
    color: ${({ $connected }) => ($connected ? '#7effc7' : '#ffffff')};
    box-shadow: ${({ $connected }) => ($connected ? '0 0 24px rgba(126,255,199,0.22)' : 'none')};
  }

  .muse-notice-copy {
    min-width: 0;
    display: grid;
    gap: 0.1rem;
  }

  .muse-notice-title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: 0;
  }

  .muse-notice-meta {
    margin: 0;
    color: rgba(255, 255, 255, 0.62);
    font-size: 11px;
    line-height: 1.35;
  }

  .muse-notice-hint {
    margin: 0.08rem 0 0;
    color: rgba(255, 255, 255, 0.34);
    font-size: 10px;
    line-height: 1.2;
  }

  .muse-notice-pulse {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: ${({ $connected }) => ($connected ? '#7effc7' : '#ffffff')};
    box-shadow: ${({ $connected }) => ($connected ? '0 0 16px rgba(126,255,199,0.85)' : '0 0 12px rgba(255,255,255,0.45)')};
    animation: musePulse 1.3s ease-in-out infinite;
  }

  @keyframes musePulse {
    0%, 100% {
      transform: scale(0.9);
      opacity: 0.72;
    }
    50% {
      transform: scale(1.12);
      opacity: 1;
    }
  }
`;

export const getDefaultMuseNoticePosition = (hasBack) => ({
  x: MUSE_NOTICE_DEFAULT_LEFT_PX,
  y: hasBack ? MUSE_NOTICE_DEFAULT_TOP_WITH_BACK_PX : MUSE_NOTICE_DEFAULT_TOP_PX,
});

export const readStoredMuseNoticePosition = (hasBack) => {
  if (typeof window === 'undefined') {
    return getDefaultMuseNoticePosition(hasBack);
  }

  try {
    const storedValue = window.localStorage.getItem(MUSE_NOTICE_POSITION_STORAGE_KEY);
    const storedPosition = storedValue ? JSON.parse(storedValue) : null;
    const x = Number(storedPosition?.x);
    const y = Number(storedPosition?.y);

    if (Number.isFinite(x) && Number.isFinite(y)) {
      return { x, y };
    }
  } catch {
    // Ignore invalid local storage and fall back to the default corner.
  }

  return getDefaultMuseNoticePosition(hasBack);
};

export const clampMuseNoticePosition = (position, element) => {
  if (typeof window === 'undefined') {
    return position;
  }

  const noticeWidth = element?.offsetWidth || 320;
  const noticeHeight = element?.offsetHeight || 96;
  const maxX = Math.max(MUSE_NOTICE_MARGIN_PX, window.innerWidth - noticeWidth - MUSE_NOTICE_MARGIN_PX);
  const maxY = Math.max(MUSE_NOTICE_MARGIN_PX, window.innerHeight - noticeHeight - MUSE_NOTICE_MARGIN_PX);

  return {
    x: Math.min(maxX, Math.max(MUSE_NOTICE_MARGIN_PX, position.x)),
    y: Math.min(maxY, Math.max(MUSE_NOTICE_MARGIN_PX, position.y)),
  };
};

const MuseConnectionNotice = ({
  status,
  hasBack = false,
}) => {
  const noticeRef = useRef(null);
  const dragStateRef = useRef(null);
  const [position, setPosition] = useState(() => readStoredMuseNoticePosition(hasBack));
  const [isDragging, setIsDragging] = useState(false);
  const connected = status === 'connected';
  const visible = status === 'connecting' || status === 'connected';

  const updatePosition = (nextPosition, shouldPersist = false) => {
    const clampedPosition = clampMuseNoticePosition(nextPosition, noticeRef.current);
    setPosition(clampedPosition);

    if (shouldPersist && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(MUSE_NOTICE_POSITION_STORAGE_KEY, JSON.stringify(clampedPosition));
      } catch {
        // Position persistence is best-effort.
      }
    }

    return clampedPosition;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => {
      setPosition((currentPosition) => clampMuseNoticePosition(currentPosition, noticeRef.current));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!dragStateRef.current) return;

    event.preventDefault();
    updatePosition({
      x: dragStateRef.current.originX + event.clientX - dragStateRef.current.startX,
      y: dragStateRef.current.originY + event.clientY - dragStateRef.current.startY,
    });
  };

  const handlePointerEnd = (event) => {
    if (!dragStateRef.current) return;

    event.preventDefault();
    const finalPosition = updatePosition(
      {
        x: dragStateRef.current.originX + event.clientX - dragStateRef.current.startX,
        y: dragStateRef.current.originY + event.clientY - dragStateRef.current.startY,
      },
      true
    );

    dragStateRef.current = null;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    return finalPosition;
  };

  if (!visible) return null;

  return (
    <MuseLiveNotice
      ref={noticeRef}
      $connected={connected}
      $hasBack={hasBack}
      $position={position}
      $isDragging={isDragging}
      aria-label="Muse S Athena connection notice"
      title="드래그해서 위치 이동"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div className="muse-notice-main">
        <span className="muse-notice-icon">
          {connected ? <BluetoothConnected size={16} /> : <Activity size={16} />}
        </span>
        <div className="muse-notice-copy">
          <p className="muse-notice-title">
            {connected ? 'Muse S Athena 연결됨' : 'Muse S Athena 연결 중'}
          </p>
          <p className="muse-notice-meta">
          {connected ? '실시간 EEG 스트리밍을 유지합니다.' : 'Bluetooth 페어링과 스트림 초기화를 진행 중입니다.'}
          </p>
          <p className="muse-notice-hint">드래그로 위치 이동</p>
        </div>
        <span className="muse-notice-pulse" />
      </div>
    </MuseLiveNotice>
  );
};

export default MuseConnectionNotice;
