import { describe, expect, it } from 'vitest';
import {
  clampMuseNoticePosition,
  getDefaultMuseNoticePosition,
} from './MuseConnectionNotice';

describe('Muse connection notice positioning', () => {
  it('places the notice below the back button when needed', () => {
    expect(getDefaultMuseNoticePosition(false)).toEqual({ x: 22, y: 22 });
    expect(getDefaultMuseNoticePosition(true)).toEqual({ x: 22, y: 106 });
  });

  it('clamps notice coordinates to the viewport when window is available', () => {
    const originalWindow = globalThis.window;
    globalThis.window = {
      innerWidth: 360,
      innerHeight: 240,
    };

    try {
      expect(clampMuseNoticePosition({ x: -40, y: 999 }, { offsetWidth: 120, offsetHeight: 60 })).toEqual({
        x: 12,
        y: 168,
      });
    } finally {
      globalThis.window = originalWindow;
    }
  });
});
