import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Type, 
  Layers, 
  Sparkles, 
  Sliders, 
  Eye
} from 'lucide-react';
import { showToast } from './Toast';

interface ThumbnailEditorProps {
  initialImageUrl?: string | null;
}

const FONT_OPTIONS = [
  { label: 'Impact (Classic YouTube)', value: 'Impact, sans-serif' },
  { label: 'Outfit (Modern Bold)', value: 'Outfit, sans-serif' },
  { label: 'Inter (Clean Sans)', value: 'Inter, sans-serif' },
  { label: 'Montserrat (Bold Clean)', value: 'Montserrat, sans-serif' },
  { label: 'Arial Black', value: '"Arial Black", sans-serif' },
];

const PRESET_BADGES = ['MUST WATCH', 'NEW', '4K HD', 'TUTORIAL', 'VIRAL', 'LIVE'];

export const ThumbnailEditor: React.FC<ThumbnailEditorProps> = ({ initialImageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Source Image State
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Canvas Resolution
  const [canvasWidth, setCanvasWidth] = useState(1280);
  const [canvasHeight, setCanvasHeight] = useState(720);

  // Headline Controls
  const [headline, setHeadline] = useState('AMAZING TITLE HERE');
  const [headlineFontSize, setHeadlineFontSize] = useState(72);
  const [headlineColor, setHeadlineColor] = useState('#ffffff');
  const [headlineFont, setHeadlineFont] = useState('Impact, sans-serif');
  const [headlineStrokeColor, setHeadlineStrokeColor] = useState('#000000');
  const [headlineStrokeWidth, setHeadlineStrokeWidth] = useState(8);
  const [headlineShadow, setHeadlineShadow] = useState(true);
  const [headlineY, setHeadlineY] = useState(180);

  // Subtitle Controls
  const [subtitle, setSubtitle] = useState('Watch Before It is Too Late!');
  const [subtitleFontSize, setSubtitleFontSize] = useState(42);
  const [subtitleColor, setSubtitleColor] = useState('#facc15'); // vibrant yellow
  const [subtitleStrokeColor, setSubtitleStrokeColor] = useState('#000000');
  const [subtitleStrokeWidth, setSubtitleStrokeWidth] = useState(6);
  const [subtitleY, setSubtitleY] = useState(260);

  // Badge / Pill
  const [badgeText, setBadgeText] = useState('MUST WATCH');
  const [badgeColor, setBadgeColor] = useState('#ec4899'); // pink
  const [showBadge, setShowBadge] = useState(true);

  // Overlays & Filters
  const [darkGradientBottom, setDarkGradientBottom] = useState(true);
  const [darkGradientTop, setDarkGradientTop] = useState(false);
  const [vignette, setVignette] = useState(false);
  const [brightness, setBrightness] = useState(100); // 100% default
  const [contrast, setContrast] = useState(105);   // 105% default
  const [tintColor, setTintColor] = useState('#000000');
  const [tintOpacity, setTintOpacity] = useState(0); // 0 to 100

  // Drag and drop / file upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load image from URL (either initialImageUrl or uploaded)
  const loadImageFromUrl = useCallback((url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setSourceImage(img);
      setImageLoaded(true);
      showToast({
        type: 'success',
        title: 'Image Loaded',
        message: 'Loaded into Thumbnail Enhancement Studio!',
      });
    };
    img.onerror = () => {
      showToast({
        type: 'error',
        title: 'Image Load Error',
        message: 'Could not load the specified image for editing.',
      });
    };
    img.src = url;
  }, []);

  useEffect(() => {
    if (initialImageUrl) {
      loadImageFromUrl(initialImageUrl);
    }
  }, [initialImageUrl, loadImageFromUrl]);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadImageFromUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Render to canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Apply brightness and contrast filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Draw Source Image or Dark Placeholder
    if (sourceImage && imageLoaded) {
      // Draw image to fill canvas maintaining aspect ratio (cover mode)
      const imgRatio = sourceImage.width / sourceImage.height;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = canvasHeight * imgRatio;
        offsetX = (canvasWidth - drawWidth) / 2;
      } else {
        drawHeight = canvasWidth / imgRatio;
        offsetY = (canvasHeight - drawHeight) / 2;
      }

      ctx.drawImage(sourceImage, offsetX, offsetY, drawWidth, drawHeight);
    } else {
      // Default dark gradient background
      const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      grad.addColorStop(0, '#111827');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Placeholder hint
      ctx.filter = 'none';
      ctx.font = '24px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('Upload an image or send from Downloader / AI Generator', canvasWidth / 2, canvasHeight / 2 - 20);
    }

    // Reset filter for overlays and text
    ctx.filter = 'none';

    // 1. Color Tint Overlay
    if (tintOpacity > 0) {
      ctx.fillStyle = tintColor;
      ctx.globalAlpha = tintOpacity / 100;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.globalAlpha = 1.0;
    }

    // 2. Bottom Dark Gradient Overlay (for text readability)
    if (darkGradientBottom) {
      const bGrad = ctx.createLinearGradient(0, canvasHeight * 0.4, 0, canvasHeight);
      bGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      bGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
      bGrad.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
      ctx.fillStyle = bGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 3. Top Dark Gradient Overlay
    if (darkGradientTop) {
      const tGrad = ctx.createLinearGradient(0, canvasHeight * 0.4, 0, 0);
      tGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      tGrad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = tGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 4. Vignette Overlay
    if (vignette) {
      const radGrad = ctx.createRadialGradient(
        canvasWidth / 2,
        canvasHeight / 2,
        canvasWidth * 0.3,
        canvasWidth / 2,
        canvasHeight / 2,
        canvasWidth * 0.7
      );
      radGrad.addColorStop(0, 'rgba(0,0,0,0)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 5. Draw Badge / Sticker
    if (showBadge && badgeText.trim()) {
      const badgePaddingX = 24;
      const bFont = 'bold 26px Outfit, sans-serif';
      ctx.font = bFont;
      const metrics = ctx.measureText(badgeText.toUpperCase());
      const bWidth = metrics.width + badgePaddingX * 2;
      const bHeight = 44;
      const bX = 50;
      const bY = 50;

      // Badge Rounded Rect
      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bWidth, bHeight, 8);
      ctx.fill();

      // Badge Text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText.toUpperCase(), bX + bWidth / 2, bY + bHeight / 2);
    }

    // 6. Draw Headline Text
    if (headline.trim()) {
      ctx.font = `bold ${headlineFontSize}px ${headlineFont}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const x = canvasWidth / 2;
      const y = headlineY;

      // Stroke / Outline
      if (headlineStrokeWidth > 0) {
        ctx.strokeStyle = headlineStrokeColor;
        ctx.lineWidth = headlineStrokeWidth;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;
        ctx.strokeText(headline.toUpperCase(), x, y);
      }

      // Shadow
      if (headlineShadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 6;
      } else {
        ctx.shadowColor = 'transparent';
      }

      // Fill
      ctx.fillStyle = headlineColor;
      ctx.fillText(headline.toUpperCase(), x, y);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // 7. Draw Subtitle Text
    if (subtitle.trim()) {
      ctx.font = `bold ${subtitleFontSize}px ${headlineFont}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const x = canvasWidth / 2;
      const y = subtitleY;

      if (subtitleStrokeWidth > 0) {
        ctx.strokeStyle = subtitleStrokeColor;
        ctx.lineWidth = subtitleStrokeWidth;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;
        ctx.strokeText(subtitle, x, y);
      }

      ctx.fillStyle = subtitleColor;
      ctx.fillText(subtitle, x, y);
    }
  }, [
    sourceImage,
    imageLoaded,
    canvasWidth,
    canvasHeight,
    headline,
    headlineFontSize,
    headlineColor,
    headlineFont,
    headlineStrokeColor,
    headlineStrokeWidth,
    headlineShadow,
    headlineY,
    subtitle,
    subtitleFontSize,
    subtitleColor,
    subtitleStrokeColor,
    subtitleStrokeWidth,
    subtitleY,
    badgeText,
    badgeColor,
    showBadge,
    darkGradientBottom,
    darkGradientTop,
    vignette,
    brightness,
    contrast,
    tintColor,
    tintOpacity,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Export & Download
  const handleDownload = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      const link = document.createElement('a');
      link.download = `custom-thumbnail-${Date.now()}.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        type: 'success',
        title: 'Exported Successfully',
        message: `Saved high-resolution thumbnail as ${format.toUpperCase()}`,
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not export canvas. Please check image permissions.',
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#111827] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">Thumbnail Enhancement Studio</h2>
            <p className="text-xs text-slate-400">
              100% Client-side HTML5 Canvas composition &middot; Add bold titles, stickers & overlays
            </p>
          </div>
        </div>

        {/* Upload Button & Resolution presets */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Main Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Canvas Live Preview on Left/Center (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="w-full bg-[#111827] p-5 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                Live Canvas (1280 &times; 720 px)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">16:9 Standard</span>
            </div>

            {/* Canvas Element with Responsive Wrapper */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/80 border border-white/10 shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Download Buttons below canvas */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/[0.06]">
              <span className="text-xs text-slate-400">Export high-fidelity output:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload('png')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={() => handleDownload('jpeg')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JPEG</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Controls on Right (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-[#111827] p-6 rounded-2xl border border-white/10 shadow-xl max-h-[820px] overflow-y-auto">
          
          {/* Section 1: Headline */}
          <div className="space-y-3 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-400" />
                Main Headline
              </label>
              <span className="text-[11px] text-slate-400 font-mono">{headlineFontSize}px</span>
            </div>

            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="YOUR BOLD TITLE"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Font Family</label>
                <select
                  value={headlineFont}
                  onChange={(e) => setHeadlineFont(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-xs text-white focus:outline-none"
                >
                  {FONT_OPTIONS.map((f, i) => (
                    <option key={i} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={headlineColor}
                    onChange={(e) => setHeadlineColor(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-300">{headlineColor}</span>
                </div>
              </div>
            </div>

            {/* Slider: Font Size & Position Y */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Font Size</span>
                <span>{headlineFontSize}px</span>
              </div>
              <input
                type="range"
                min="32"
                max="120"
                value={headlineFontSize}
                onChange={(e) => setHeadlineFontSize(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Vertical Position</span>
                <span>{headlineY}px</span>
              </div>
              <input
                type="range"
                min="50"
                max="650"
                value={headlineY}
                onChange={(e) => setHeadlineY(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Stroke Outline & Shadow toggles */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={headlineStrokeColor}
                  onChange={(e) => setHeadlineStrokeColor(e.target.value)}
                  className="w-6 h-6 rounded border border-white/10 bg-transparent cursor-pointer"
                />
                <span className="text-xs text-slate-300">Outline ({headlineStrokeWidth}px)</span>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={headlineShadow}
                  onChange={(e) => setHeadlineShadow(e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>Drop Shadow</span>
              </label>
            </div>
          </div>

          {/* Section 2: Subtitle */}
          <div className="space-y-3 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-yellow-400" />
                Subtitle / Catchphrase
              </label>
              <span className="text-[11px] text-slate-400 font-mono">{subtitleFontSize}px</span>
            </div>

            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Catchy Subtitle..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={subtitleColor}
                    onChange={(e) => setSubtitleColor(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-300">{subtitleColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Position Y</label>
                <input
                  type="range"
                  min="50"
                  max="650"
                  value={subtitleY}
                  onChange={(e) => setSubtitleY(Number(e.target.value))}
                  className="w-full accent-yellow-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Badge / Pill Sticker */}
          <div className="space-y-3 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Sticker Badge
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBadge}
                  onChange={(e) => setShowBadge(e.target.checked)}
                  className="accent-pink-500 rounded"
                />
                <span>Enable</span>
              </label>
            </div>

            {showBadge && (
              <>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0d121f] border border-white/10 text-xs text-white"
                  />
                  <input
                    type="color"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="w-8 h-8 rounded border border-white/10 bg-transparent cursor-pointer"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_BADGES.map((b, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBadgeText(b)}
                      className="px-2 py-0.5 rounded text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Section 4: Lighting & Overlays */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              Overlays & Image Filters
            </label>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkGradientBottom}
                  onChange={(e) => setDarkGradientBottom(e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>Bottom Fade</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkGradientTop}
                  onChange={(e) => setDarkGradientTop(e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>Top Fade</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={vignette}
                  onChange={(e) => setVignette(e.target.checked)}
                  className="accent-indigo-500 rounded"
                />
                <span>Vignette Edge Darkness</span>
              </label>
            </div>

            {/* Brightness & Contrast */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Brightness</span>
                <span>{brightness}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-teal-500"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Contrast</span>
                <span>{contrast}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="160"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
