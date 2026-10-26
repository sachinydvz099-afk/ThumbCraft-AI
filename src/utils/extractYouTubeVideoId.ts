/**
 * YouTube Video ID Extraction Utility
 * 
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - Direct 11-character video IDs
 */

export interface ExtractionResult {
  videoId: string | null;
  isValid: boolean;
  error?: string;
  originalInput: string;
  canonicalUrl?: string;
}

// 11-character YouTube video ID regex pattern: letters, numbers, hyphens, underscores
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

const ALLOWED_HOSTNAMES = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'gaming.youtube.com',
  'youtu.be',
  'www.youtu.be'
]);

export function extractYouTubeVideoId(input: string): ExtractionResult {
  const trimmed = (input || '').trim();

  if (!trimmed) {
    return {
      videoId: null,
      isValid: false,
      error: 'Please enter a YouTube video URL or ID.',
      originalInput: input,
    };
  }

  // Check if user directly entered a raw 11-character video ID
  if (VIDEO_ID_REGEX.test(trimmed)) {
    return {
      videoId: trimmed,
      isValid: true,
      originalInput: input,
      canonicalUrl: `https://www.youtube.com/watch?v=${trimmed}`,
    };
  }

  // Ensure input looks like a URL
  let parsedUrl: URL;
  try {
    // Add protocol if user typed "youtube.com/watch?v=..."
    const urlString = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsedUrl = new URL(urlString);
  } catch {
    return {
      videoId: null,
      isValid: false,
      error: 'Invalid URL format. Please paste a valid web address.',
      originalInput: input,
    };
  }

  // Normalize hostname (strip port and leading www)
  const hostname = parsedUrl.hostname.toLowerCase();
  const isAllowedHost = Array.from(ALLOWED_HOSTNAMES).some(allowed => 
    hostname === allowed || hostname.endsWith(`.${allowed}`)
  );

  if (!isAllowedHost) {
    return {
      videoId: null,
      isValid: false,
      error: `Unsupported domain "${hostname}". Only youtube.com and youtu.be links are supported.`,
      originalInput: input,
    };
  }

  let extractedId: string | null = null;

  // Case 1: youtu.be/VIDEO_ID
  if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && VIDEO_ID_REGEX.test(pathParts[0])) {
      extractedId = pathParts[0];
    }
  }

  // Case 2: youtube.com/watch?v=VIDEO_ID
  if (!extractedId && parsedUrl.searchParams.has('v')) {
    const v = parsedUrl.searchParams.get('v');
    if (v && VIDEO_ID_REGEX.test(v)) {
      extractedId = v;
    }
  }

  // Case 3: youtube.com/shorts/VIDEO_ID
  // Case 4: youtube.com/embed/VIDEO_ID
  // Case 5: youtube.com/live/VIDEO_ID
  // Case 6: youtube.com/v/VIDEO_ID
  if (!extractedId) {
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    const prefixes = ['shorts', 'embed', 'live', 'v', 'e'];
    
    for (let i = 0; i < pathParts.length; i++) {
      if (prefixes.includes(pathParts[i].toLowerCase()) && i + 1 < pathParts.length) {
        const candidate = pathParts[i + 1];
        if (VIDEO_ID_REGEX.test(candidate)) {
          extractedId = candidate;
          break;
        }
      }
    }
  }

  // Case 7: attribution_link?u=/watch?v=VIDEO_ID
  if (!extractedId && parsedUrl.pathname.includes('attribution_link')) {
    const u = parsedUrl.searchParams.get('u');
    if (u) {
      try {
        const nestedUrl = new URL(u, 'https://www.youtube.com');
        const v = nestedUrl.searchParams.get('v');
        if (v && VIDEO_ID_REGEX.test(v)) {
          extractedId = v;
        }
      } catch {
        // ignore nested parse failure
      }
    }
  }

  if (extractedId) {
    return {
      videoId: extractedId,
      isValid: true,
      originalInput: input,
      canonicalUrl: `https://www.youtube.com/watch?v=${extractedId}`,
    };
  }

  return {
    videoId: null,
    isValid: false,
    error: 'Could not find a valid 11-character YouTube video ID in this URL.',
    originalInput: input,
  };
}
