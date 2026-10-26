import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Upload, 
  Download, 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  FlipHorizontal, 
  SlidersHorizontal,
  Youtube,
  Smile,
  Layers,
  Check
} from 'lucide-react';
import { 
  FaceOverlaySettings, 
  DEFAULT_FACE_SETTINGS, 
  REACTION_PRESETS, 
  drawFaceSwapOverlay, 
  MaskShape 
} from '../services/faceSwap';
import { extractYouTubeVideoId } from '../utils/extractYouTubeVideoId';
import { showToast } from './Toast';

interface FaceSwapStudioProps {
  initialBaseUrl?: string | null;
  onSendToEditor: (imageUrl: string) => void;
}

export const FaceSwapStudio: React.FC<FaceSwapStudioProps> = ({
  initialBaseUrl,
  onSendToEditor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Base Thumbnail Image State
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [baseLoaded, setBaseLoaded] = useState(false);
  const [quickYoutubeUrl, setQuickYoutubeUrl] = useState('');

  // Face / Reaction Image State
  const [faceImage, setFaceImage] = useState<HTMLImageElement | null>(null);
  const [faceLoaded, setFaceLoaded] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('shocked');

  // Face Overlay Settings
  const [settings, setSettings] = useState<FaceOverlaySettings>(DEFAULT_FACE_SETTINGS);

  // File Inputs
  const baseFileInputRef = useRef<HTMLInputElement | null>(null);
  const faceFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Base Image from URL
  const loadBaseFromUrl = useCallback((url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setBaseImage(img);
      setBaseLoaded(true);
      showToast({
        type: 'success',
        title: 'Base Thumbnail Loaded',
        message: 'Base thumbnail loaded into Face Swap Studio.',
      });
    };
    img.onerror = () => {
      showToast({
        type: 'error',
        title: 'Load Error',
        message: 'Could not load base thumbnail image.',
      });
    };
    img.src = url;
  }, []);

  // Load Face Image from URL
  const loadFaceFromUrl = useCallback((url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setFaceImage(img);
      setFaceLoaded(true);
      showToast({
        type: 'success',
        title: 'Face Photo Loaded',
        message: 'Face ready for positioning & blending.',
      });
    };
    img.onerror = () => {
      showToast({
        type: 'error',
        title: 'Face Load Error',
        message: 'Could not load face photo.',
      });
    };
    img.src = url;
  }, []);

  // Initial load
  useEffect(() => {
    if (initialBaseUrl) {
      loadBaseFromUrl(initialBaseUrl);
    } else {
      // Default sample base thumbnail (LoFi room standard)
      loadBaseFromUrl('https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg');
    }

    // Default load first reaction preset
    loadFaceFromUrl(REACTION_PRESETS[0].svgDataUrl);
  }, [initialBaseUrl, loadBaseFromUrl, loadFaceFromUrl]);

  // Handle Base File Upload
  const handleBaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadBaseFromUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Face File Upload
  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPresetId(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          loadFaceFromUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick YouTube fetch for Base
  const handleFetchYouTubeBase = (e: React.FormEvent) => {
    e.preventDefault();
    const res = extractYouTubeVideoId(quickYoutubeUrl);
    if (res.isValid && res.videoId) {
      loadBaseFromUrl(`https://img.youtube.com/vi/${res.videoId}/maxresdefault.jpg`);
      setQuickYoutubeUrl('');
    } else {
      showToast({
        type: 'error',
        title: 'Invalid YouTube URL',
        message: res.error || 'Please enter a valid YouTube video link.',
      });
    }
  };

  // Select Reaction Preset
  const handleSelectPreset = (preset: typeof REACTION_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    loadFaceFromUrl(preset.svgDataUrl);
  };

  // Draw on Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1280;
    const height = 720;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Base Thumbnail
    if (baseImage && baseLoaded) {
      ctx.drawImage(baseImage, 0, 0, width, height);
    } else {
      // Background gradient placeholder
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.font = '24px Inter, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText('Upload or paste a base YouTube thumbnail', width / 2, height / 2);
    }

    // 2. Draw Face Swap / Reaction Overlay
    if (faceImage && faceLoaded) {
      drawFaceSwapOverlay(ctx, faceImage, width, height, settings);
    }
  }, [baseImage, baseLoaded, faceImage, faceLoaded, settings]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Download Output
  const handleDownload = (format: 'png' | 'jpeg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      const url = canvas.toDataURL(mime, 0.95);
      const link = document.createElement('a');
      link.download = `thumbcraft-faceswap-${Date.now()}.${format}`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast({
        type: 'success',
        title: 'Downloaded Successfully!',
        message: `Saved face swapped thumbnail as ${format.toUpperCase()}`,
      });
    } catch {
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Could not export canvas image.',
      });
    }
  };

  const handleExportToEditor = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png', 0.95);
    onSendToEditor(dataUrl);
  };

  const updateSetting = <K extends keyof FaceOverlaySettings>(key: K, val: FaceOverlaySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Studio Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#111827] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <Smile className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">Thumbnail Face Swap & Creator Studio</h2>
            <p className="text-xs text-slate-400">
              Put your face or reaction onto any YouTube thumbnail &middot; Cutouts, MrBeast sticker glow & lighting match
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettings(DEFAULT_FACE_SETTINGS)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            title="Reset to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Face</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left / Center: Live Canvas Workspace (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="w-full bg-[#111827] p-5 rounded-2xl border border-white/10 shadow-xl">
            
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-pink-400" />
                Live Thumbnail Preview (1280 &times; 720 px)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">16:9 Standard</span>
            </div>

            {/* Canvas Element */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/80 border border-white/10 shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Quick YouTube Base Loader */}
            <form onSubmit={handleFetchYouTubeBase} className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-500 shrink-0" />
              <input
                type="text"
                value={quickYoutubeUrl}
                onChange={(e) => setQuickYoutubeUrl(e.target.value)}
                placeholder="Paste YouTube link to replace base thumbnail…"
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#0d121f] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors shrink-0"
              >
                Fetch
              </button>
            </form>

            {/* Export Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload('png')}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-md shadow-pink-600/30 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Swapped Thumbnail</span>
                </button>
                <button
                  onClick={() => handleDownload('jpeg')}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  JPEG
                </button>
              </div>

              <button
                onClick={handleExportToEditor}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <span>Add Titles in Studio &rarr;</span>
              </button>
            </div>

          </div>

          {/* Upload Dropzones Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Base Image Upload Card */}
            <div 
              onClick={() => baseFileInputRef.current?.click()}
              className="p-4 rounded-xl border border-dashed border-white/15 hover:border-indigo-500/50 bg-[#111827]/70 hover:bg-[#161f33] cursor-pointer transition-all flex items-center gap-3 group"
            >
              <input
                type="file"
                ref={baseFileInputRef}
                onChange={handleBaseUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Upload Base Thumbnail</h4>
                <p className="text-[11px] text-slate-400">Upload background image or video frame</p>
              </div>
            </div>

            {/* Face Image Upload Card */}
            <div 
              onClick={() => faceFileInputRef.current?.click()}
              className="p-4 rounded-xl border border-dashed border-white/15 hover:border-pink-500/50 bg-[#111827]/70 hover:bg-[#161f33] cursor-pointer transition-all flex items-center gap-3 group"
            >
              <input
                type="file"
                ref={faceFileInputRef}
                onChange={handleFaceUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="w-9 h-9 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Upload Your Face Photo</h4>
                <p className="text-[11px] text-slate-400">Selfie, reaction photo, or PNG</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right: Face & Sticker Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5 bg-[#111827] p-6 rounded-2xl border border-white/10 shadow-xl max-h-[820px] overflow-y-auto">
          
          {/* Section 1: Instant Creator Reaction Stickers */}
          <div className="space-y-3 pb-5 border-b border-white/[0.08]">
            <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Instant Creator Reactions
            </label>
            <p className="text-[11px] text-slate-400">
              Pick a high-CTR reaction sticker or upload your own face above:
            </p>
            <div className="grid grid-cols-5 gap-2">
              {REACTION_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'bg-pink-950/40 border-pink-500 ring-2 ring-pink-500/30'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.06]'
                    }`}
                    title={preset.description}
                  >
                    <span className="text-2xl">{preset.emoji}</span>
                    <span className="text-[9px] text-slate-300 font-medium truncate w-full">{preset.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Cutout Shape & YouTube Sticker Glow */}
          <div className="space-y-3 pb-5 border-b border-white/[0.08]">
            <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Cutout Style & Border
            </label>

            <div className="grid grid-cols-4 gap-2">
              {(['glow-sticker', 'circle', 'oval', 'rounded'] as MaskShape[]).map((shape) => {
                const isSelected = settings.maskShape === shape;
                return (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => updateSetting('maskShape', shape)}
                    className={`py-2 px-1 rounded-lg text-xs font-medium border capitalize transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border-white/[0.06]'
                    }`}
                  >
                    {shape === 'glow-sticker' ? 'Sticker' : shape}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Border Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.borderColor}
                    onChange={(e) => updateSetting('borderColor', e.target.value)}
                    className="w-7 h-7 rounded border border-white/10 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-300">{settings.borderColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Glow Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.glowColor}
                    onChange={(e) => updateSetting('glowColor', e.target.value)}
                    className="w-7 h-7 rounded border border-white/10 bg-transparent cursor-pointer"
                  />
                  <span className="text-xs font-mono text-slate-300">{settings.glowColor}</span>
                </div>
              </div>
            </div>

            {/* Border Width & Glow Blur */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Outline Width</span>
                <span>{settings.borderWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={settings.borderWidth}
                onChange={(e) => updateSetting('borderWidth', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Neon Glow Radius</span>
                <span>{settings.glowBlur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={settings.glowBlur}
                onChange={(e) => updateSetting('glowBlur', Number(e.target.value))}
                className="w-full accent-pink-500"
              />
            </div>
          </div>

          {/* Section 3: Position, Scale & Rotation */}
          <div className="space-y-3 pb-5 border-b border-white/[0.08]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-yellow-400" />
                Placement & Size
              </label>
              <button
                type="button"
                onClick={() => updateSetting('flipHorizontal', !settings.flipHorizontal)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition-colors ${
                  settings.flipHorizontal
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-white/5 text-slate-300 border-white/10'
                }`}
              >
                <FlipHorizontal className="w-3 h-3" />
                <span>Flip Face</span>
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Horizontal Position (X)</span>
                <span>{settings.x}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={settings.x}
                onChange={(e) => updateSetting('x', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Vertical Position (Y)</span>
                <span>{settings.y}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={settings.y}
                onChange={(e) => updateSetting('y', Number(e.target.value))}
                className="w-full accent-indigo-500"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Face Scale</span>
                <span>{Math.round(settings.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="250"
                value={Math.round(settings.scale * 100)}
                onChange={(e) => updateSetting('scale', Number(e.target.value) / 100)}
                className="w-full accent-pink-500"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Angle / Tilt</span>
                <span>{settings.rotation}&deg;</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                value={settings.rotation}
                onChange={(e) => updateSetting('rotation', Number(e.target.value))}
                className="w-full accent-purple-500"
              />
            </div>
          </div>

          {/* Section 4: Lighting & Color Matching */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Lighting & Color Match
            </label>
            <p className="text-[11px] text-slate-400">
              Match the face lighting to the base thumbnail background:
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Face Brightness</span>
                <span>{settings.brightness}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="150"
                value={settings.brightness}
                onChange={(e) => updateSetting('brightness', Number(e.target.value))}
                className="w-full accent-teal-500"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Face Contrast</span>
                <span>{settings.contrast}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="150"
                value={settings.contrast}
                onChange={(e) => updateSetting('contrast', Number(e.target.value))}
                className="w-full accent-teal-500"
              />

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Color Warmth / Tint</span>
                <span>{settings.warmth > 0 ? `+${settings.warmth} Warm` : settings.warmth < 0 ? `${settings.warmth} Cool` : 'Neutral'}</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                value={settings.warmth}
                onChange={(e) => updateSetting('warmth', Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
