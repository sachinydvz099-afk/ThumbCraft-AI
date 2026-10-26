import { describe, it, expect } from 'vitest';
import { getThumbnailOptions } from './youtubeThumbnail';

describe('youtubeThumbnail service', () => {
  const testId = 'dQw4w9WgXcQ';

  it('generates all 5 resolution tiers in correct priority order', () => {
    const options = getThumbnailOptions(testId);
    expect(options).toHaveLength(5);

    expect(options[0].key).toBe('maxres');
    expect(options[0].url).toBe(`https://img.youtube.com/vi/${testId}/maxresdefault.jpg`);
    expect(options[0].width).toBe(1280);
    expect(options[0].height).toBe(720);
    expect(options[0].isMaxRes).toBe(true);

    expect(options[1].key).toBe('standard');
    expect(options[1].url).toBe(`https://img.youtube.com/vi/${testId}/sddefault.jpg`);

    expect(options[2].key).toBe('high');
    expect(options[2].url).toBe(`https://img.youtube.com/vi/${testId}/hqdefault.jpg`);

    expect(options[3].key).toBe('medium');
    expect(options[3].url).toBe(`https://img.youtube.com/vi/${testId}/mqdefault.jpg`);

    expect(options[4].key).toBe('default');
    expect(options[4].url).toBe(`https://img.youtube.com/vi/${testId}/default.jpg`);
  });

  it('labels only maxres as isMaxRes', () => {
    const options = getThumbnailOptions(testId);
    const maxResOptions = options.filter(o => o.isMaxRes);
    expect(maxResOptions).toHaveLength(1);
    expect(maxResOptions[0].key).toBe('maxres');
  });

  it('correctly maps 16:9 and 4:3 aspect ratios for YouTube standards', () => {
    const options = getThumbnailOptions(testId);
    const maxres = options.find(o => o.key === 'maxres');
    const hq = options.find(o => o.key === 'high');

    expect(maxres?.aspectRatio).toBe('16:9');
    expect(hq?.aspectRatio).toBe('4:3');
  });
});
