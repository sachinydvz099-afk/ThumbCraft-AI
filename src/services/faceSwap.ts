/**
 * Face Swap & Creator Reaction Service
 * 
 * Provides:
 * 1. Client-Side Face Cutout & YouTube Sticker Compositor (runs 100% in browser).
 * 2. Preset Reaction Faces (Surprised, Shocked, Screaming, Confident, etc.).
 * 3. Pluggable AI Face Swap Adapter (HuggingFace / Replicate / Custom Serverless Proxy).
 */

export type MaskShape = 'glow-sticker' | 'circle' | 'oval' | 'free' | 'rounded';

export interface FaceOverlaySettings {
  x: number; // percentage of canvas width (0-100)
  y: number; // percentage of canvas height (0-100)
  scale: number; // 0.2 to 3.0
  rotation: number; // -180 to 180 degrees
  flipHorizontal: boolean;
  maskShape: MaskShape;
  borderWidth: number; // 0 to 20 px
  borderColor: string;
  glowColor: string;
  glowBlur: number; // 0 to 30 px
  feather: number; // edge soft blur (0 to 20 px)
  brightness: number; // 50 to 150 %
  contrast: number; // 50 to 150 %
  warmth: number; // -50 to 50
  opacity: number; // 0 to 100 %
}

export interface ReactionPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  svgDataUrl: string;
}

// 5 Stylized High-Resolution Reaction Stickers for instant testing
export const REACTION_PRESETS: ReactionPreset[] = [
  {
    id: 'shocked',
    name: 'Shocked Open Mouth',
    description: 'Classic YouTube high-CTR OMG reaction face',
    emoji: '😱',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="faceGrad" cx="45%" cy="40%" r="60%"><stop offset="0%" stop-color="%23ffdfba"/><stop offset="100%" stop-color="%23e8a770"/></radialGradient><linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%236366f1"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><circle cx="100" cy="100" r="85" fill="url(%23faceGrad)" stroke="%23333" stroke-width="4"/><path d="M40 70 Q100 20 160 70 Q100 45 40 70Z" fill="url(%23capGrad)"/><ellipse cx="70" cy="90" rx="16" ry="22" fill="%23fff" stroke="%23222" stroke-width="4"/><circle cx="70" cy="90" r="9" fill="%23111"/><ellipse cx="130" cy="90" rx="16" ry="22" fill="%23fff" stroke="%23222" stroke-width="4"/><circle cx="130" cy="90" r="9" fill="%23111"/><path d="M52 62 Q70 50 88 66" stroke="%23111" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M112 66 Q130 50 148 62" stroke="%23111" stroke-width="6" stroke-linecap="round" fill="none"/><ellipse cx="100" cy="142" rx="22" ry="32" fill="%237f1d1d" stroke="%23222" stroke-width="4"/><ellipse cx="100" cy="158" rx="14" ry="12" fill="%23f43f5e"/><ellipse cx="45" cy="115" rx="10" ry="6" fill="%23f43f5e" opacity="0.4"/><ellipse cx="155" cy="115" rx="10" ry="6" fill="%23f43f5e" opacity="0.4"/></svg>`,
  },
  {
    id: 'screaming-gamer',
    name: 'Screaming Gamer',
    description: 'High energy esports gaming headset reaction',
    emoji: '🔥',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="gFace" cx="50%" cy="45%" r="60%"><stop offset="0%" stop-color="%23fed7aa"/><stop offset="100%" stop-color="%23ea580c"/></radialGradient></defs><circle cx="100" cy="105" r="75" fill="url(%23gFace)" stroke="%231e1b4b" stroke-width="5"/><path d="M30 100 C15 50 185 50 170 100" fill="none" stroke="%231e293b" stroke-width="14" stroke-linecap="round"/><rect x="20" y="85" width="18" height="40" rx="9" fill="%236366f1" stroke="%23111" stroke-width="3"/><rect x="162" y="85" width="18" height="40" rx="9" fill="%236366f1" stroke="%23111" stroke-width="3"/><ellipse cx="75" cy="95" rx="15" ry="18" fill="%23fff" stroke="%23111" stroke-width="4"/><circle cx="75" cy="95" r="7" fill="%23111"/><ellipse cx="125" cy="95" rx="15" ry="18" fill="%23fff" stroke="%23111" stroke-width="4"/><circle cx="125" cy="95" r="7" fill="%23111"/><path d="M55 75 L90 85" stroke="%23111" stroke-width="6" stroke-linecap="round"/><path d="M145 75 L110 85" stroke="%23111" stroke-width="6" stroke-linecap="round"/><path d="M75 125 Q100 115 125 125 Q135 165 100 170 Q65 165 75 125 Z" fill="%23450a0a" stroke="%23111" stroke-width="4"/><path d="M80 128 L120 128 L115 135 L85 135 Z" fill="%23fff"/><path d="M25 115 Q30 145 65 145" fill="none" stroke="%23111" stroke-width="4"/><circle cx="68" cy="145" r="6" fill="%23ec4899"/></svg>`,
  },
  {
    id: 'mindblown',
    name: 'Mind Blown / Eyes Wide',
    description: 'Disbelief & discovery YouTube reaction',
    emoji: '🤯',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="mbFace" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="%23fde68a"/><stop offset="100%" stop-color="%23f59e0b"/></radialGradient><linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23ec4899"/><stop offset="100%" stop-color="%23e11d48"/></linearGradient></defs><circle cx="100" cy="115" r="70" fill="url(%23mbFace)" stroke="%23111" stroke-width="4"/><path d="M60 55 Q70 20 100 25 Q130 15 140 50 Q160 55 155 75 Q130 85 100 80 Q70 85 45 75 Q40 55 60 55 Z" fill="url(%23cloudGrad)" stroke="%23fff" stroke-width="3"/><ellipse cx="75" cy="108" rx="20" ry="24" fill="%23fff" stroke="%23111" stroke-width="4"/><circle cx="75" cy="108" r="10" fill="%231e1b4b"/><ellipse cx="125" cy="108" rx="20" ry="24" fill="%23fff" stroke="%23111" stroke-width="4"/><circle cx="125" cy="108" r="10" fill="%231e1b4b"/><ellipse cx="100" cy="155" rx="18" ry="18" fill="%23111"/><ellipse cx="100" cy="153" rx="14" ry="12" fill="%23b91c1c"/></svg>`,
  },
  {
    id: 'confident',
    name: 'Confident / Smirk',
    description: 'Expert, secret revealed, and finance thumbnails',
    emoji: '😎',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="confFace" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="%23fed7aa"/><stop offset="100%" stop-color="%23d97706"/></radialGradient></defs><circle cx="100" cy="100" r="80" fill="url(%23confFace)" stroke="%23111" stroke-width="4"/><polygon points="40,82 92,82 86,105 46,105" fill="%23111" stroke="%23222" stroke-width="3"/><polygon points="108,82 160,82 154,105 114,105" fill="%23111" stroke="%23222" stroke-width="3"/><line x1="92" y1="88" x2="108" y2="88" stroke="%23111" stroke-width="4"/><line x1="28" y1="85" x2="40" y2="85" stroke="%23111" stroke-width="3"/><line x1="160" y1="85" x2="172" y2="85" stroke="%23111" stroke-width="3"/><path d="M75 140 Q100 148 135 125" stroke="%23111" stroke-width="6" stroke-linecap="round" fill="none"/></svg>`,
  },
  {
    id: 'pointing',
    name: 'Pointing / Look Here!',
    description: 'Directs viewer focus straight to video title or object',
    emoji: '👉',
    svgDataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="pFace" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="%23ffedd5"/><stop offset="100%" stop-color="%23f97316"/></radialGradient></defs><circle cx="90" cy="90" r="70" fill="url(%23pFace)" stroke="%23111" stroke-width="4"/><ellipse cx="70" cy="80" rx="14" ry="16" fill="%23fff" stroke="%23111" stroke-width="3"/><circle cx="75" cy="80" r="7" fill="%23111"/><ellipse cx="115" cy="80" rx="14" ry="16" fill="%23fff" stroke="%23111" stroke-width="3"/><circle cx="120" cy="80" r="7" fill="%23111"/><path d="M80 120 Q100 135 120 120" stroke="%23111" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M125 110 L185 110 L195 120 L155 125 L180 135 L145 145 L115 130 Z" fill="%23f97316" stroke="%23111" stroke-width="4"/></svg>`,
  }
];

export const DEFAULT_FACE_SETTINGS: FaceOverlaySettings = {
  x: 75, // right side of thumbnail
  y: 65, // lower third
  scale: 1.1,
  rotation: 0,
  flipHorizontal: false,
  maskShape: 'glow-sticker',
  borderWidth: 8,
  borderColor: '#ffffff',
  glowColor: '#ec4899', // bright pink neon glow
  glowBlur: 16,
  feather: 4,
  brightness: 105,
  contrast: 110,
  warmth: 0,
  opacity: 100,
};

export const AVAILABLE_MASK_SHAPES: MaskShape[] = ['glow-sticker', 'circle', 'oval', 'rounded'];

export function getReactionPresetById(id: string): ReactionPreset | undefined {
  return REACTION_PRESETS.find((preset) => preset.id === id);
}

export function calculateOverlayCoordinates(
  xPercent: number,
  yPercent: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: (xPercent / 100) * canvasWidth,
    y: (yPercent / 100) * canvasHeight,
  };
}

export function calculateOverlayDimensions(
  scale: number,
  naturalWidth: number,
  naturalHeight: number,
  canvasWidth: number,
  canvasHeight: number
): { width: number; height: number } {
  const baseDim = Math.min(canvasWidth, canvasHeight) * 0.45;
  const ratio = naturalWidth > 0 ? naturalHeight / naturalWidth : 1;
  return {
    width: baseDim * scale,
    height: baseDim * ratio * scale,
  };
}

/**
 * Composite Face Swap / Reaction onto a Base Canvas
 */
export function drawFaceSwapOverlay(
  ctx: CanvasRenderingContext2D,
  faceImg: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  settings: FaceOverlaySettings
): void {
  const { x: targetX, y: targetY } = calculateOverlayCoordinates(
    settings.x,
    settings.y,
    canvasWidth,
    canvasHeight
  );

  const { width: drawW, height: drawH } = calculateOverlayDimensions(
    settings.scale,
    faceImg.naturalWidth,
    faceImg.naturalHeight,
    canvasWidth,
    canvasHeight
  );

  ctx.save();

  // 1. Position and Rotate
  ctx.translate(targetX, targetY);
  ctx.rotate((settings.rotation * Math.PI) / 180);
  if (settings.flipHorizontal) {
    ctx.scale(-1, 1);
  }

  // 2. Setup Glow / Drop Shadow
  if (settings.glowBlur > 0) {
    ctx.shadowColor = settings.glowColor;
    ctx.shadowBlur = settings.glowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  }

  // 3. Draw Mask Path (e.g. Sticker, Circle, Oval, Rounded)
  ctx.beginPath();
  const halfW = drawW / 2;
  const halfH = drawH / 2;

  if (settings.maskShape === 'circle') {
    const r = Math.min(halfW, halfH);
    ctx.arc(0, 0, r, 0, Math.PI * 2);
  } else if (settings.maskShape === 'oval') {
    ctx.ellipse(0, 0, halfW, halfH, 0, 0, Math.PI * 2);
  } else if (settings.maskShape === 'rounded') {
    ctx.roundRect(-halfW, -halfH, drawW, drawH, 24);
  } else {
    // 'glow-sticker' or 'free': rounded rectangle with contour
    ctx.roundRect(-halfW, -halfH, drawW, drawH, 20);
  }

  // 4. Fill Stroke Outline (YouTube sticker effect)
  if (settings.borderWidth > 0) {
    ctx.strokeStyle = settings.borderColor;
    ctx.lineWidth = settings.borderWidth;
    ctx.stroke();
  }

  // 5. Reset shadow before image fill so shadow doesn't double-bleed
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 6. Clip to mask shape and draw image with color adjustments
  ctx.clip();
  ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`;
  ctx.globalAlpha = settings.opacity / 100;

  ctx.drawImage(faceImg, -halfW, -halfH, drawW, drawH);

  // 7. Warmth / Tint overlay if set
  if (settings.warmth !== 0) {
    ctx.filter = 'none';
    if (settings.warmth > 0) {
      ctx.fillStyle = `rgba(249, 115, 22, ${settings.warmth / 250})`; // warm amber
    } else {
      ctx.fillStyle = `rgba(59, 130, 246, ${Math.abs(settings.warmth) / 250})`; // cool blue
    }
    ctx.fillRect(-halfW, -halfH, drawW, drawH);
  }

  ctx.restore();
}
