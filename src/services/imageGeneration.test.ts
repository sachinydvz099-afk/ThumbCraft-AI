import { describe, it, expect } from 'vitest';
import { 
  buildCompositePrompt, 
  generateThumbnailImage, 
  ASPECT_RATIOS 
} from './imageGeneration';

describe('imageGeneration service', () => {
  it('builds composite prompt with style preset and context', () => {
    const prompt = buildCompositePrompt({
      prompt: 'Cyberpunk city with flying cars',
      videoTitle: 'Future of Tech 2050',
      subtitle: 'Shocking Predictions!',
      style: 'gaming',
      aspectRatio: '16:9',
    });

    expect(prompt).toContain('Cyberpunk city with flying cars');
    expect(prompt).toContain('neon lighting');
    expect(prompt).toContain('Future of Tech 2050');
    expect(prompt).toContain('Shocking Predictions!');
    expect(prompt).toContain('YouTube thumbnail format');
  });

  it('rejects generation when provider is unconfigured', async () => {
    await expect(
      generateThumbnailImage(
        {
          prompt: 'A futuristic thumbnail',
          style: 'technology',
          aspectRatio: '16:9',
        },
        { type: 'unconfigured' }
      )
    ).rejects.toThrow('AI Image Provider is not configured');
  });

  it('rejects empty prompt submissions', async () => {
    await expect(
      generateThumbnailImage(
        {
          prompt: '   ',
          style: 'custom',
          aspectRatio: '16:9',
        },
        { type: 'pollinations' }
      )
    ).rejects.toThrow('Please enter a description');
  });

  it('correctly maps 16:9 dimensions to 1280x720', () => {
    expect(ASPECT_RATIOS['16:9'].width).toBe(1280);
    expect(ASPECT_RATIOS['16:9'].height).toBe(720);
  });
});
