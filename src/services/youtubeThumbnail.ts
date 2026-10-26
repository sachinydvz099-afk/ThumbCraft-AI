/**
 * YouTube Thumbnail Service
 * 
 * Manages resolution URLs, image dimension detection, availability verification,
 * and fallback resolution negotiation.
 */

export type ResolutionKey = 'maxres' | 'standard' | 'high' | 'medium' | 'default';

export interface ThumbnailOption {
  key: ResolutionKey;
  label: string;
  badge: string;
  expectedDimensions: string;
  width: number;
  height: number;
  url: string;
  isMaxRes: boolean;
  aspectRatio: '16:9' | '4:3';
}

export interface ThumbnailCheckResult {
  key: ResolutionKey;
  isAvailable: boolean;
  actualWidth: number;
  actualHeight: number;
  error?: string;
}

export function getThumbnailOptions(videoId: string): ThumbnailOption[] {
  return [
    {
      key: 'maxres',
      label: 'Maximum Resolution (1080p / 720p)',
      badge: 'MaxRes HD',
      expectedDimensions: '1280 × 720 px',
      width: 1280,
      height: 720,
      url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      isMaxRes: true,
      aspectRatio: '16:9',
    },
    {
      key: 'standard',
      label: 'Standard Quality (SD 480p)',
      badge: 'Standard SD',
      expectedDimensions: '640 × 480 px',
      width: 640,
      height: 480,
      url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
      isMaxRes: false,
      aspectRatio: '4:3',
    },
    {
      key: 'high',
      label: 'High Quality (HQ)',
      badge: 'High Quality',
      expectedDimensions: '480 × 360 px',
      width: 480,
      height: 360,
      url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      isMaxRes: false,
      aspectRatio: '4:3',
    },
    {
      key: 'medium',
      label: 'Medium Quality (MQ)',
      badge: 'Medium Quality',
      expectedDimensions: '320 × 180 px',
      width: 320,
      height: 180,
      url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      isMaxRes: false,
      aspectRatio: '16:9',
    },
    {
      key: 'default',
      label: 'Default / Low Res',
      badge: 'Default',
      expectedDimensions: '120 × 90 px',
      width: 120,
      height: 90,
      url: `https://img.youtube.com/vi/${videoId}/default.jpg`,
      isMaxRes: false,
      aspectRatio: '4:3',
    },
  ];
}

/**
 * Checks if a specific thumbnail URL is genuinely available.
 * 
 * Note: When a YouTube video does NOT have a maxresdefault or sddefault,
 * Google's CDN returns a 120x90 placeholder image with HTTP 200, or a 404.
 * If naturalWidth <= 120 and naturalHeight <= 90 on a high-res request,
 * it is a placeholder and should be treated as unavailable!
 */
export function checkThumbnailImage(url: string, key: ResolutionKey): Promise<ThumbnailCheckResult> {
  return new Promise((resolve) => {
    const img = new Image();
    
    // Set a timeout to prevent hanging on slow network
    const timer = setTimeout(() => {
      resolve({
        key,
        isAvailable: false,
        actualWidth: 0,
        actualHeight: 0,
        error: 'Image check timed out',
      });
    }, 7000);

    img.onload = () => {
      clearTimeout(timer);
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      // Google returns a 120x90 dummy gray/black image if maxres or sddefault does not exist
      if ((key === 'maxres' || key === 'standard') && w <= 120 && h <= 90) {
        resolve({
          key,
          isAvailable: false,
          actualWidth: w,
          actualHeight: h,
          error: 'YouTube returned a placeholder image for this resolution.',
        });
        return;
      }

      resolve({
        key,
        isAvailable: w > 0 && h > 0,
        actualWidth: w,
        actualHeight: h,
      });
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve({
        key,
        isAvailable: false,
        actualWidth: 0,
        actualHeight: 0,
        error: 'Failed to load image from YouTube server.',
      });
    };

    img.src = url;
  });
}
