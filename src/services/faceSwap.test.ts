import { describe, it, expect } from 'vitest';
import { 
  REACTION_PRESETS, 
  DEFAULT_FACE_SETTINGS, 
  AVAILABLE_MASK_SHAPES,
  getReactionPresetById,
  calculateOverlayCoordinates,
  calculateOverlayDimensions
} from './faceSwap';

describe('Face Swap & Creator Reaction Service', () => {
  it('should have 5 high-CTR reaction sticker presets configured', () => {
    expect(REACTION_PRESETS).toHaveLength(5);
    const ids = REACTION_PRESETS.map((p) => p.id);
    expect(ids).toContain('shocked');
    expect(ids).toContain('screaming-gamer');
    expect(ids).toContain('mindblown');
    expect(ids).toContain('confident');
    expect(ids).toContain('pointing');
  });

  it('each reaction preset should contain a valid SVG data URI and emoji', () => {
    REACTION_PRESETS.forEach((preset) => {
      expect(preset.name).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.emoji).toBeTruthy();
      expect(preset.svgDataUrl).toMatch(/^data:image\/svg\+xml;utf8,<svg/);
    });
  });

  it('getReactionPresetById should find presets by ID or return undefined', () => {
    const shocked = getReactionPresetById('shocked');
    expect(shocked).toBeDefined();
    expect(shocked?.name).toBe('Shocked Open Mouth');

    const nonExistent = getReactionPresetById('invalid-preset-id');
    expect(nonExistent).toBeUndefined();
  });

  it('should provide default face overlay settings suitable for 16:9 YouTube thumbnails', () => {
    expect(DEFAULT_FACE_SETTINGS.x).toBe(75);
    expect(DEFAULT_FACE_SETTINGS.y).toBe(65);
    expect(DEFAULT_FACE_SETTINGS.scale).toBeGreaterThan(0.5);
    expect(DEFAULT_FACE_SETTINGS.maskShape).toBe('glow-sticker');
    expect(DEFAULT_FACE_SETTINGS.borderWidth).toBe(8);
    expect(DEFAULT_FACE_SETTINGS.borderColor).toBe('#ffffff');
    expect(DEFAULT_FACE_SETTINGS.opacity).toBe(100);
  });

  it('calculateOverlayCoordinates should convert percentage to canvas pixels', () => {
    // 1280x720 canvas
    const coords = calculateOverlayCoordinates(50, 50, 1280, 720);
    expect(coords.x).toBe(640);
    expect(coords.y).toBe(360);

    const corner = calculateOverlayCoordinates(0, 0, 1280, 720);
    expect(corner.x).toBe(0);
    expect(corner.y).toBe(0);

    const rightLower = calculateOverlayCoordinates(75, 65, 1280, 720);
    expect(rightLower.x).toBe(960);
    expect(rightLower.y).toBe(468);
  });

  it('calculateOverlayDimensions should preserve image aspect ratio and respect scale', () => {
    // Canvas 1280x720, min dim is 720. baseDim = 720 * 0.45 = 324
    // Natural 200x200 (1:1 ratio)
    const dimSquare = calculateOverlayDimensions(1.0, 200, 200, 1280, 720);
    expect(dimSquare.width).toBeCloseTo(324);
    expect(dimSquare.height).toBeCloseTo(324);

    // Natural 200x400 (1:2 ratio)
    const dimTall = calculateOverlayDimensions(1.0, 200, 400, 1280, 720);
    expect(dimTall.width).toBeCloseTo(324);
    expect(dimTall.height).toBeCloseTo(648);

    // Scale 1.5x
    const dimScaled = calculateOverlayDimensions(1.5, 200, 200, 1280, 720);
    expect(dimScaled.width).toBeCloseTo(324 * 1.5);
    expect(dimScaled.height).toBeCloseTo(324 * 1.5);
  });

  it('should define available mask shapes for creator sticker styles', () => {
    expect(AVAILABLE_MASK_SHAPES).toContain('glow-sticker');
    expect(AVAILABLE_MASK_SHAPES).toContain('circle');
    expect(AVAILABLE_MASK_SHAPES).toContain('oval');
    expect(AVAILABLE_MASK_SHAPES).toContain('rounded');
  });
});
