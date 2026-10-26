import React from 'react';
import { Sparkles, Download, Wand2, ShieldCheck, Zap, Layers } from 'lucide-react';

interface HeroProps {
  onQuickDownload: () => void;
  onExploreAi: () => void;
  onOpenEditor: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onQuickDownload,
  onExploreAi,
  onOpenEditor,
}) => {
  return (
    <div className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 overflow-hidden">
      {/* Background Decorative Glow Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">
        
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-indigo-300 mb-6 backdrop-blur-md shadow-inner">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span className="font-medium">All-in-One Thumbnail Toolkit &middot; No Account Required</span>
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-display leading-[1.15] mb-6">
          Create Stunning YouTube <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
            Thumbnails in Seconds
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
          Download existing YouTube thumbnails, explore resolutions, and design eye-catching alternatives with AI.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-10">
          <button
            onClick={onQuickDownload}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Download Thumbnail</span>
          </button>

          <button
            onClick={onExploreAi}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-200 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Wand2 className="w-5 h-5 text-purple-400" />
            <span>Create with AI</span>
          </button>

          <button
            onClick={onOpenEditor}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base text-slate-300 hover:text-white bg-transparent hover:bg-white/[0.04] transition-all"
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Open Studio Editor</span>
          </button>
        </div>

        {/* Value Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Full 1080p & 720p MaxRes</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Free & No Sign-up</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-400 col-span-2 sm:col-span-1">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>AI Generator + Browser Editor</span>
          </div>
        </div>

      </div>
    </div>
  );
};
