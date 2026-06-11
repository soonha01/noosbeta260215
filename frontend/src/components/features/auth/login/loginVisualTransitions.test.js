import { describe, expect, it } from 'vitest';
import {
  WARP_STAR_COUNT,
  createWarpStarRenderData,
  createWarpStars,
} from './loginVisualTransitions';

describe('login visual transition helpers', () => {
  it('generates deterministic warp stars for login transitions', () => {
    const first = createWarpStars();
    const second = createWarpStars();

    expect(first).toHaveLength(WARP_STAR_COUNT);
    expect(second).toEqual(first);
    expect(first[0]).toMatchObject({
      id: 'warp-star-0',
    });
    expect(first[0].distance).toBeGreaterThanOrEqual(220);
  });

  it('derives stable CSS variable render data for entry overlays', () => {
    const stars = [
      {
        id: 'warp-star-0',
        angleDeg: 45,
        distance: 300,
        duration: 1,
        delay: 0.5,
        size: 2,
        opacity: 0.6,
      },
    ];

    expect(createWarpStarRenderData(stars, { idPrefix: 'entry-', entryMode: true })).toEqual([
      {
        id: 'entry-warp-star-0',
        style: {
          '--angle': '45deg',
          '--distance': '460px',
          '--duration': '1.45s',
          '--delay': '0.1s',
          '--size': '1.9px',
          '--star-opacity': '0.6799999999999999',
        },
      },
    ]);
  });
});
