import React, { useState } from 'react';
import { 
  Wand2, 
  Sparkles, 
  RefreshCw, 
  Download, 
  SlidersHorizontal, 
  Settings2, 
  AlertCircle, 
  Check, 
  Info
} from 'lucide-react';
import { 
  GenerationSettings, 
  GenerationResult, 
  STYLE_PRESETS, 
  ASPECT_RATIOS, 
  AspectRatio, 
  generateThumbnailImage,
  ProviderConfig 
} from '../services/imageGeneration';
import { downloadImage } from '../utils/downloadImage';
import { showToast } from './Toast';

interface AiGeneratorProps {
  providerConfig: ProviderConfig;
  onOpenSettings: () => void;
  onSendToEditor: (imageUrl: string) => void;
  initialTitle?: string;
}

const INSPIRATION_PROMPTS = [
  {
    category: 'Gaming',
    text: 'Create a dramatic gaming thumbnail with neon lighting, a surprised expression, and bold yellow text.',
    style: 'gaming',
  },
  {
    category: 'Technology',
    text: 'Design a professional technology thumbnail featuring an AI robot and a futuristic background.',
    style: 'technology',
  },
  {
    category: 'Travel Vlog',
    text: 'Create a cinematic Indian travel vlog thumbnail featuring mountains, vibrant colors, and dramatic lighting.',
    style: 'travel',
  },
  {
    category: 'Finance',
    text: 'Design a finance YouTube thumbnail with a rising graph, a dark background, and bold white text.',
    style: 'finance',
  },
  {
    category: 'Fitness',
    text: 'Energetic gym athlete celebrating a personal record with explosive lighting and high contrast.',
    style: 'fitness',
  },
];

export const AiGenerator: React.FC<AiGeneratorProps> = ({
  providerConfig,
  onOpenSettings,
  onSendToEditor,
  initialTitle = '',
}) => {
  const [prompt, setPrompt] = useState('');
  const [videoTitle, setVideoTitle] = useState(initialTitle);
  const [subtitle, setSubtitle] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('gaming');
  const [selectedAspect, setSelectedAspect] = useState<AspectRatio>('16:9');

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!prompt.trim() && !videoTitle.trim()) {
      setError('Please provide a prompt or video title to generate a thumbnail.');
      return;
    }

    setError(null);
    setIsGenerating(true);

    const settings: GenerationSettings = {
      prompt: prompt.trim() || `YouTube thumbnail for video titled: ${videoTitle.trim()}`,
      videoTitle: videoTitle.trim(),
      subtitle: subtitle.trim(),
      style: selectedStyle,
      aspectRatio: selectedAspect,
    };

    try {
      const generated = await generateThumbnailImage(settings, providerConfig);
      setResult(generated);
      showToast({
        type: 'success',
        title: 'Thumbnail Generated!',
        message: 'Your AI thumbnail is ready for download or further editing.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate AI thumbnail.';
      setError(msg);
      showToast({
        type: 'error',
        title: 'Generation Failed',
        message: msg,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    setIsDownloading(true);

    const filename = `ai-thumbnail-${selectedStyle}-${Date.now()}.png`;

    try {
      const res = await downloadImage(result.imageUrl, filename);
      if (res.method === 'new-tab') {
        showToast({
          type: 'info',
          title: 'Opened in New Tab',
          message: res.message,
          actionUrl: result.imageUrl,
          actionLabel: 'View Full Image',
        });
      } else {
        showToast({
          type: 'success',
          title: 'Downloaded!',
          message: `Saved as ${filename}`,
        });
      }
    } catch (err: unknown) {
      console.error(err);
      window.open(result.imageUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const applyInspiration = (item: typeof INSPIRATION_PROMPTS[0]) => {
    setPrompt(item.text);
    setSelectedStyle(item.style);
    setError(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      
      {/* Header with Provider Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#111827] border border-white/10 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">AI Thumbnail Generator</h2>
            <p className="text-xs text-slate-400">
              Transform descriptive prompts into high-conversion YouTube thumbnails
            </p>
          </div>
        </div>

        {/* Provider Config Status & Settings */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            providerConfig.type === 'unconfigured'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              providerConfig.type === 'unconfigured' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`} />
            <span>
              {providerConfig.type === 'pollinations' ? 'Free AI Engine (Active)' :
               providerConfig.type === 'custom-proxy' ? 'Custom Serverless Proxy' :
               providerConfig.type === 'openai-compatible' ? 'OpenAI Direct API' : 'Unconfigured'}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
            title="Configure AI Provider"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Configure</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form on Left, Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6 bg-[#111827] p-6 sm:p-7 rounded-2xl border border-white/10 shadow-xl">
          
          {/* Inspiration Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                Prompt Inspiration
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INSPIRATION_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyInspiration(item)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-purple-500/30 text-slate-300 hover:text-white transition-all text-left"
                >
                  <span className="font-semibold text-purple-400">{item.category}:</span> {item.text.slice(0, 36)}…
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div>
            <label htmlFor="ai-prompt-input" className="block text-sm font-semibold text-white mb-2">
              Describe your thumbnail idea <span className="text-pink-400">*</span>
            </label>
            <textarea
              id="ai-prompt-input"
              rows={4}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Create a dramatic gaming thumbnail with neon lighting, a surprised expression, and bold yellow text..."
              className="w-full p-4 rounded-xl bg-[#0d121f] border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Be specific about characters, lighting, background, and mood</span>
              <span>{prompt.length} chars</span>
            </div>
          </div>

          {/* Optional Title & Subtitle Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ai-video-title" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Video Title (Optional)
              </label>
              <input
                id="ai-video-title"
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g. I Survived 100 Days in Hardcore"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label htmlFor="ai-subtitle" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Headline / Subtitle (Optional)
              </label>
              <input
                id="ai-subtitle"
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. IMPOSSIBLE CHALLENGE!"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d121f] border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Visual Style Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STYLE_PRESETS.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-md shadow-purple-600/30'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border-white/[0.06]'
                    }`}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(ASPECT_RATIOS) as AspectRatio[]).map((aspect) => {
                const info = ASPECT_RATIOS[aspect];
                const isSelected = selectedAspect === aspect;
                return (
                  <button
                    key={aspect}
                    type="button"
                    onClick={() => setSelectedAspect(aspect)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 text-white'
                        : 'bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 border-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{info.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {info.width} &times; {info.height}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{error}</p>
                {providerConfig.type === 'unconfigured' && (
                  <button
                    onClick={onOpenSettings}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-300 underline"
                  >
                    Open Settings to configure a provider &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            id="generate-thumbnail-btn"
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generating Thumbnail with AI…</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate Thumbnail</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated Preview & Actions */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#111827] p-6 sm:p-7 rounded-2xl border border-white/10 shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white font-display">Generated Output</h3>
              {result && (
                <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  {result.width} &times; {result.height} px
                </span>
              )}
            </div>

            {/* Preview Box */}
            <div className={`relative w-full rounded-xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center shadow-inner ${
              selectedAspect === '16:9' ? 'aspect-video' : selectedAspect === '1:1' ? 'aspect-square' : 'aspect-[9/16]'
            }`}>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center gap-3 p-6 text-center text-slate-300">
                  <div className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-white">Rendering AI Artwork…</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Applying style modifiers, lighting, and composition
                  </p>
                </div>
              ) : result ? (
                <img
                  src={result.imageUrl}
                  alt="AI Generated Thumbnail"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <Wand2 className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="text-sm font-medium text-slate-300 mb-1">No Thumbnail Generated Yet</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Enter a prompt or video concept on the left, then click "Generate Thumbnail"
                  </p>
                </div>
              )}
            </div>

            {/* Prompt details badge */}
            {result && (
              <div className="mt-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 font-mono line-clamp-2">
                <span className="text-purple-400 font-semibold font-sans">Prompt: </span>
                {result.promptUsed}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-6 mt-6 border-t border-white/[0.08]">
            {result ? (
              <>
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Generated Thumbnail</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    onClick={() => onSendToEditor(result.imageUrl)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 transition-all"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Open in Studio</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-slate-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Generated images can be opened in the Studio Editor to add custom text, stickers, and filters.</span>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
