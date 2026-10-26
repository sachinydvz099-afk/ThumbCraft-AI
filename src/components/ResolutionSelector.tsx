import React from 'react';
import { 
  ThumbnailOption, 
  ThumbnailCheckResult, 
  ResolutionKey 
} from '../services/youtubeThumbnail';
import { DownloadButton } from './DownloadButton';
import { CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';

interface ResolutionSelectorProps {
  videoId: string;
  options: ThumbnailOption[];
  availability: Record<ResolutionKey, ThumbnailCheckResult | null>;
  selectedKey: ResolutionKey;
  onSelectKey: (key: ResolutionKey) => void;
  onOpenInEditor?: (url: string) => void;
}

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({
  videoId,
  options,
  availability,
  selectedKey,
  onSelectKey,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white font-display">Available Thumbnail Resolutions</h3>
          <p className="text-xs text-slate-400">
            Detected from YouTube CDN servers. Select a card to preview or download directly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {options.map((opt) => {
          const status = availability[opt.key];
          const isChecking = status === null;
          const isAvailable = status ? status.isAvailable : false;
          const isSelected = selectedKey === opt.key;

          return (
            <div
              key={opt.key}
              onClick={() => isAvailable && onSelectKey(opt.key)}
              className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/50'
                  : isAvailable
                  ? 'bg-[#111827]/70 hover:bg-[#161f33] border-white/[0.08] hover:border-white/20'
                  : 'bg-[#111827]/30 border-white/[0.04] opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                {/* Header row: Badge and Availability pill */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
                    opt.isMaxRes
                      ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30'
                      : 'bg-white/5 text-slate-300 border border-white/10'
                  }`}>
                    {opt.badge}
                  </span>

                  {isChecking ? (
                    <span className="flex items-center gap-1 text-[11px] text-indigo-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Checking...</span>
                    </span>
                  ) : isAvailable ? (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Available</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-400/90" title={status?.error || 'Resolution unavailable on YouTube'}>
                      <AlertCircle className="w-3 h-3" />
                      <span>Unavailable</span>
                    </span>
                  )}
                </div>

                {/* Resolution Title & Dimensions */}
                <h4 className="text-sm font-semibold text-white mb-1 leading-snug">
                  {opt.label}
                </h4>

                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-mono">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {status && status.actualWidth > 0
                      ? `${status.actualWidth} × ${status.actualHeight} px`
                      : opt.expectedDimensions}
                  </span>
                  <span className="text-slate-400">&bull;</span>
                  <span className="text-slate-400 font-sans">{opt.aspectRatio}</span>
                </div>
              </div>

              {/* Action row */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400">
                  {isSelected ? 'Currently Viewing' : isAvailable ? 'Click to preview' : 'Not generated'}
                </span>

                <DownloadButton
                  url={opt.url}
                  videoId={videoId}
                  resolutionKey={opt.key}
                  resolutionLabel={opt.badge}
                  isAvailable={isAvailable}
                  variant="compact"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
