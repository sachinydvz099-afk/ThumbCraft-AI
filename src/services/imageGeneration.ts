/**
 * Image Generation Service & Provider Adapter Architecture
 * 
 * Provides an interchangeable adapter pattern for AI image generation.
 * Supports:
 * - Unconfigured / Manual Backend Mode (honest empty status with setup guide)
 * - Free Public AI Adapter (Pollinations - no secret API keys required, safe for static GitHub Pages)
 * - Custom Serverless Backend Proxy (e.g. Cloudflare Worker, AWS Lambda, Vercel Function)
 * - OpenAI / Custom Compatible Endpoint (user-provided in browser localStorage)
 */

export type AspectRatio = '16:9' | '1:1' | '9:16';

export type ProviderType = 'unconfigured' | 'pollinations' | 'custom-proxy' | 'openai-compatible';

export interface GenerationSettings {
  prompt: string;
  videoTitle?: string;
  subtitle?: string;
  style: string;
  aspectRatio: AspectRatio;
}

export interface ProviderConfig {
  type: ProviderType;
  customEndpoint?: string;
  apiKey?: string; // Stored only in user's browser localStorage if provided
  modelName?: string;
}

export interface GenerationResult {
  imageUrl: string;
  blob?: Blob;
  promptUsed: string;
  provider: ProviderType;
  seed?: number;
  width: number;
  height: number;
}

const STORAGE_KEY = 'thumbcraft_ai_provider_config';

export const STYLE_PRESETS = [
  { id: 'gaming', label: 'Gaming', promptModifier: 'high contrast dramatic neon lighting, bold saturated colors, vibrant esports aesthetic, hyper-detailed' },
  { id: 'technology', label: 'Technology', promptModifier: 'sleek minimalist futuristic, glowing blue cyber accents, modern clean lighting, premium 4K tech review look' },
  { id: 'education', label: 'Education', promptModifier: 'clean infographic style, bright natural lighting, clear readable focal points, engaging educational graphic' },
  { id: 'finance', label: 'Finance', promptModifier: 'dark charcoal background with rising holographic financial chart, luxury emerald and gold lighting, executive look' },
  { id: 'vlogging', label: 'Vlogging', promptModifier: 'cinematic lifestyle photography, warm natural sunlight, shallow depth of field, authentic engaging expressions' },
  { id: 'travel', label: 'Travel', promptModifier: 'breathtaking vibrant landscape, golden hour sunlight, dramatic mountain or coastal vista, rich colors' },
  { id: 'fitness', label: 'Fitness', promptModifier: 'energetic gym atmosphere, dynamic action pose, high contrast athletic lighting, motivational atmosphere' },
  { id: 'news', label: 'News / Commentary', promptModifier: 'breaking news television broadcast style, high-tension dramatic lighting, clean editorial background' },
  { id: 'entertainment', label: 'Entertainment', promptModifier: 'spectacular pop-culture poster style, eye-catching color contrast, blockbuster cinematic feel' },
  { id: 'custom', label: 'Custom', promptModifier: '' },
];

export const ASPECT_RATIOS: Record<AspectRatio, { width: number; height: number; label: string; description: string }> = {
  '16:9': { width: 1280, height: 720, label: '16:9 Standard', description: 'Optimal for YouTube videos (1280 × 720)' },
  '1:1': { width: 1080, height: 1080, label: '1:1 Square', description: 'Social feeds and community posts (1080 × 1080)' },
  '9:16': { width: 720, height: 1280, label: '9:16 Vertical', description: 'YouTube Shorts, TikTok, and Reels (720 × 1280)' },
};

/**
 * Load provider config from browser localStorage.
 * Default is 'pollinations' (a free, zero-key public generation adapter)
 * or 'unconfigured' if the user selects manual backend.
 */
export function loadProviderConfig(): ProviderConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read provider configuration from localStorage:', err);
  }

  // Default to Pollinations (free public adapter) so visitors have an immediately working AI generator,
  // while fully supporting switching to Unconfigured or Custom Serverless Proxy.
  return {
    type: 'pollinations',
    modelName: 'flux',
  };
}

export function saveProviderConfig(config: ProviderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save provider configuration:', err);
  }
}

/**
 * Builds the composite prompt from user's fields, style modifiers, and title/subtitle text.
 */
export function buildCompositePrompt(settings: GenerationSettings): string {
  const parts: string[] = [];

  // Core user prompt
  if (settings.prompt.trim()) {
    parts.push(settings.prompt.trim());
  }

  // Style modifier
  const preset = STYLE_PRESETS.find(p => p.id === settings.style);
  if (preset && preset.promptModifier) {
    parts.push(preset.promptModifier);
  }

  // YouTube title context
  if (settings.videoTitle?.trim()) {
    parts.push(`concept for YouTube video titled "${settings.videoTitle.trim()}"`);
  }

  // Subtitle/headline context
  if (settings.subtitle?.trim()) {
    parts.push(`incorporating visual theme: ${settings.subtitle.trim()}`);
  }

  // YouTube thumbnail quality enhancement tags
  parts.push('YouTube thumbnail format, highly click-worthy, vibrant contrast, sharp focus, 8k resolution');

  return parts.join(', ');
}

/**
 * Main AI Generation Service Entry Point
 */
export async function generateThumbnailImage(
  settings: GenerationSettings,
  config?: ProviderConfig
): Promise<GenerationResult> {
  const userPrompt = (settings.prompt || '').trim();
  const videoTitle = (settings.videoTitle || '').trim();

  if (!userPrompt && !videoTitle) {
    throw new Error('Please enter a description or prompt for the thumbnail.');
  }

  const activeConfig = config || loadProviderConfig();
  const prompt = buildCompositePrompt(settings);
  const dims = ASPECT_RATIOS[settings.aspectRatio];

  // 1. Unconfigured provider
  if (activeConfig.type === 'unconfigured') {
    throw new Error(
      'AI Image Provider is not configured. ThumbCraft AI uses static hosting without backend secrets. ' +
      'Please open Settings to enable the Free Public AI Adapter or connect your custom serverless proxy endpoint.'
    );
  }

  // 2. Pollinations AI (Free Public Adapter - no API keys needed)
  if (activeConfig.type === 'pollinations') {
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 10000000);
    // Pollinations public image endpoint
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dims.width}&height=${dims.height}&seed=${seed}&nologo=true&model=${activeConfig.modelName || 'flux'}`;

    // Verify image response by pre-fetching
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`AI generation request failed with status: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return {
      imageUrl: objectUrl,
      blob,
      promptUsed: prompt,
      provider: 'pollinations',
      seed,
      width: dims.width,
      height: dims.height,
    };
  }

  // 3. Custom Serverless Proxy (Secure external endpoint)
  if (activeConfig.type === 'custom-proxy') {
    if (!activeConfig.customEndpoint) {
      throw new Error('Custom proxy endpoint URL is required. Please check your AI Settings.');
    }

    const response = await fetch(activeConfig.customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(activeConfig.apiKey ? { 'Authorization': `Bearer ${activeConfig.apiKey}` } : {})
      },
      body: JSON.stringify({
        prompt,
        width: dims.width,
        height: dims.height,
        aspectRatio: settings.aspectRatio,
        style: settings.style,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Serverless proxy failed (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();
    const imageUrl = data.imageUrl || data.url || data.image;

    if (!imageUrl) {
      throw new Error('Serverless proxy did not return an image URL in the response.');
    }

    return {
      imageUrl,
      promptUsed: prompt,
      provider: 'custom-proxy',
      width: dims.width,
      height: dims.height,
    };
  }

  // 4. OpenAI / Compatible endpoint
  if (activeConfig.type === 'openai-compatible') {
    const endpoint = activeConfig.customEndpoint || 'https://api.openai.com/v1/images/generations';
    if (!activeConfig.apiKey) {
      throw new Error('API Key is required for OpenAI-compatible endpoint. Set it in AI Settings.');
    }

    // Standard OpenAI size mapping
    let size = '1024x1024';
    if (settings.aspectRatio === '16:9') size = '1792x1024';
    if (settings.aspectRatio === '9:16') size = '1024x1792';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeConfig.apiKey}`,
      },
      body: JSON.stringify({
        model: activeConfig.modelName || 'dall-e-3',
        prompt,
        n: 1,
        size,
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const msg = errJson.error?.message || response.statusText;
      throw new Error(`OpenAI API error (${response.status}): ${msg}`);
    }

    const json = await response.json();
    const imageUrl = json.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error('OpenAI API did not return an image.');
    }

    return {
      imageUrl,
      promptUsed: prompt,
      provider: 'openai-compatible',
      width: dims.width,
      height: dims.height,
    };
  }

  throw new Error(`Unsupported provider type: ${activeConfig.type}`);
}
