import React, { useState } from 'react';
import { Download, Loader2, Check } from 'lucide-react';
import { downloadImage } from '../utils/downloadImage';
import { showToast } from './Toast';

interface DownloadButtonProps {
  url: string;
  videoId: string;
  resolutionKey: string;
  resolutionLabel: string;
  isAvailable?: boolean;
  variant?: 'primary' | 'secondary' | 'compact';
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  url,
  videoId,
  resolutionKey,
  resolutionLabel,
  isAvailable = true,
  variant = 'secondary',
  className = '',
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const filename = `youtube-thumbnail-${videoId}-${resolutionKey}.jpg`;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAvailable) {
      showToast({
        type: 'warning',
        title: 'Resolution Unavailable',
        message: 'This specific resolution was not published by the video creator on YouTube.',
      });
      return;
    }

    setDownloading(true);

    try {
      const result = await downloadImage(url, filename);
      
      if (result.method === 'new-tab') {
        showToast({
          type: 'info',
          title: 'Opened in New Tab',
          message: result.message,
          actionUrl: url,
          actionLabel: 'View Thumbnail',
        });
      } else {
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 3000);
        showToast({
          type: 'success',
          title: 'Downloaded!',
          message: `Saved as ${filename}`,
        });
      }
    } catch (err: unknown) {
      console.error('Download error:', err);
      // Absolute fallback
      window.open(url, '_blank', 'noopener,noreferrer');
      showToast({
        type: 'warning',
        title: 'Manual Save Required',
        message: 'Opening image in a new tab. Right-click the image and choose "Save Image As...".',
        actionUrl: url,
        actionLabel: 'Direct Link',
      });
    } finally {
      setDownloading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleDownload}
        disabled={downloading || !isAvailable}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
          !isAvailable
            ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
            : downloaded
            ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
            : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-white/20 active:scale-95'
        } ${className}`}
        title={`Download ${resolutionLabel}`}
      >
        {downloading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
        ) : downloaded ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Download className="w-3.5 h-3.5 text-slate-300" />
        )}
        <span>{downloaded ? 'Saved' : 'Download'}</span>
      </button>
    );
  }

  if (variant === 'primary') {
    return (
      <button
        onClick={handleDownload}
        disabled={downloading || !isAvailable}
        className={`flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-white transition-all shadow-lg active:scale-95 ${
          !isAvailable
            ? 'opacity-50 cursor-not-allowed bg-slate-800 border border-slate-700'
            : downloaded
            ? 'bg-emerald-600 shadow-emerald-600/30'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30 hover:shadow-indigo-600/50'
        } ${className}`}
      >
        {downloading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Downloading…</span>
          </>
        ) : downloaded ? (
          <>
            <Check className="w-5 h-5" />
            <span>Downloaded Successfully!</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Download {resolutionLabel}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={downloading || !isAvailable}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all border ${
        !isAvailable
          ? 'opacity-40 cursor-not-allowed bg-slate-800/50 text-slate-500 border-slate-800'
          : downloaded
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border-white/10 hover:border-white/20 active:scale-95'
      } ${className}`}
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
      ) : downloaded ? (
        <Check className="w-4 h-4 text-emerald-400" />
      ) : (
        <Download className="w-4 h-4 text-slate-400" />
      )}
      <span>{downloaded ? 'Downloaded' : `Download ${resolutionLabel}`}</span>
    </button>
  );
};
