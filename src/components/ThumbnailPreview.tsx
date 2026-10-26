import React, { useState } from 'react';
import { 
  ThumbnailOption, 
  ThumbnailCheckResult, 
  ResolutionKey 
} from '../services/youtubeThumbnail';
import { DownloadButton } from './DownloadButton';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Maximize2, 
  X, 
  AlertTriangle,
  SlidersHorizontal,
  Youtube
} from 'lucide-react';
import { showToast } from './Toast';

interface ThumbnailPreviewProps {
  videoId: string;
  canonicalUrl?: string;
  selectedOption: ThumbnailOption;
  availability: Record<ResolutionKey, ThumbnailCheckResult | null>;
  onSendToEditor: (imageUrl: string) => void;
  onSendToAi: () => void;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  videoId,
  canonicalUrl,
  selectedOption,
  availability,
  onSendToEditor,
  onSendToAi,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const checkResult = availability[selectedOption.key];
  const isAvailable = checkResult ? checkResult.isAvailable : true;
  const isChecking = checkResult === null;

  const handleCopyVideoId = async () => {
    try {
      await navigator.clipboard.writeText(videoId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
      showToast({
        type: 'success',
        title: 'Video ID Copied',
        message: `Copied "${videoId}" to clipboard.`,
      });
    } catch {
      // fallback
    }
  };

  const handleCopyUrl = async () => {
    const url = canonicalUrl || `https://www.youtube.com/watch?v=${videoId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
      showToast({
        type: 'success',
        title: 'Video URL Copied',
        message: 'YouTube video link copied to clipboard.',
      });
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full bg-[#111827] rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl overflow-hidden">
      
      {/* Top Header Row: Video ID, badges, and quick links */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-5 border-b border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm font-mono text-slate-300">
            <span className="text-slate-400 font-sans text-xs">Video ID:</span>
            <span className="font-bold text-white tracking-wider">{videoId}</span>
            <button
              onClick={handleCopyVideoId}
              className="ml-1 p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors"
              title="Copy Video ID"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <a
            href={canonicalUrl || `https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 text-xs font-semibold transition-colors"
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>Watch on YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyUrl}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-medium flex items-center gap-1.5"
            title="Copy Video URL"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Copy Link</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            title="Full Screen Preview"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 group mb-6 shadow-inner">
        {isChecking ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#111827] text-slate-400">
            <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Verifying thumbnail from YouTube CDN…</p>
          </div>
        ) : !isAvailable ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-slate-300">
            <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
            <h4 className="text-lg font-bold text-white mb-1">
              {selectedOption.badge} Unavailable for this Video
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-4">
              The video creator did not upload a thumbnail at this resolution or YouTube returned a placeholder.
              Please select one of the lower resolutions below (e.g. High Quality HQ or Medium Quality MQ).
            </p>
          </div>
        ) : (
          <>
            <img
              src={selectedOption.url}
              alt={`YouTube Thumbnail ${selectedOption.badge}`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
            {/* Overlay preview pill */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-2">
              <span className="font-semibold text-white">{selectedOption.badge}</span>
              <span className="text-slate-400">&bull;</span>
              <span>
                {checkResult && checkResult.actualWidth > 0
                  ? `${checkResult.actualWidth} × ${checkResult.actualHeight} px`
                  : selectedOption.expectedDimensions}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Primary Download Button for selected resolution */}
          <DownloadButton
            url={selectedOption.url}
            videoId={videoId}
            resolutionKey={selectedOption.key}
            resolutionLabel={selectedOption.badge}
            isAvailable={isAvailable}
            variant="primary"
            className="w-full sm:w-auto"
          />

          {/* Send to Studio Editor */}
          {isAvailable && (
            <button
              onClick={() => onSendToEditor(selectedOption.url)}
              className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-slate-200 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all active:scale-95 w-full sm:w-auto"
              title="Enhance in Studio Editor"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>Edit in Studio</span>
            </button>
          )}
        </div>

        {/* Generate AI Alternatives CTA */}
        <button
          onClick={onSendToAi}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all active:scale-95 w-full sm:w-auto"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Generate AI Alternatives</span>
        </button>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative max-w-5xl w-full bg-[#0d121f] rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="text-sm font-semibold text-white">
                {selectedOption.label} — Full Preview
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/40">
              <img
                src={selectedOption.url}
                alt="Full size thumbnail"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <DownloadButton
                url={selectedOption.url}
                videoId={videoId}
                resolutionKey={selectedOption.key}
                resolutionLabel={selectedOption.badge}
                isAvailable={isAvailable}
                variant="primary"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
