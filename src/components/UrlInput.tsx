import React, { useState, FormEvent } from 'react';
import { Search, Youtube, AlertCircle, X, Clipboard, Loader2 } from 'lucide-react';
import { extractYouTubeVideoId } from '../utils/extractYouTubeVideoId';

interface UrlInputProps {
  onSearch: (videoId: string, canonicalUrl?: string) => void;
  isLoading: boolean;
}

const SAMPLE_VIDEOS = [
  { label: 'LoFi Beats (Live/Standard)', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
  { label: 'Short URL (youtu.be)', url: 'https://youtu.be/dQw4w9WgXcQ' },
  { label: 'YouTube Shorts', url: 'https://www.youtube.com/shorts/3f7eX4K_qUo' },
  { label: 'Embed Format', url: 'https://www.youtube.com/embed/9bZkp7q19f0' },
];

export const UrlInput: React.FC<UrlInputProps> = ({ onSearch, isLoading }) => {
  const [url, setUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const result = extractYouTubeVideoId(url);

    if (!result.isValid || !result.videoId) {
      setErrorMessage(result.error || 'Please enter a valid YouTube video link.');
      return;
    }

    onSearch(result.videoId, result.canonicalUrl);
  };

  const handleClear = () => {
    setUrl('');
    setErrorMessage(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setErrorMessage(null);
        const result = extractYouTubeVideoId(text);
        if (result.isValid && result.videoId) {
          onSearch(result.videoId, result.canonicalUrl);
        }
      }
    } catch {
      // Browser permissions fallback
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setErrorMessage(null);
    const result = extractYouTubeVideoId(sampleUrl);
    if (result.isValid && result.videoId) {
      onSearch(result.videoId, result.canonicalUrl);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className={`relative flex items-center w-full rounded-2xl bg-[#111827] border transition-all duration-300 shadow-xl ${
          errorMessage
            ? 'border-rose-500/80 shadow-rose-500/10'
            : 'border-white/10 group-hover:border-indigo-500/50 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/20'
        }`}>
          
          {/* Left Icon */}
          <div className="pl-4 sm:pl-5 pr-2 text-slate-400 flex items-center pointer-events-none">
            <Youtube className="w-6 h-6 text-red-500" />
          </div>

          {/* Main Input Field */}
          <input
            id="youtube-url-input"
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder="Paste your YouTube video URL here…"
            className="w-full py-4 sm:py-5 px-2 bg-transparent text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
            autoComplete="off"
            spellCheck="false"
          />

          {/* Action Buttons inside Input */}
          <div className="flex items-center gap-1.5 pr-2 sm:pr-3">
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {!url && (
              <button
                type="button"
                onClick={handlePaste}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Paste</span>
              </button>
            )}

            <button
              id="fetch-thumbnail-btn"
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Fetching…</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Fetch Thumbnail</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message Banner */}
        {errorMessage && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}
      </form>

      {/* Quick Sample Links */}
      <div className="mt-4 flex flex-wrap items-center gap-2 justify-center text-xs text-slate-400">
        <span className="font-medium text-slate-400">Try sample:</span>
        {SAMPLE_VIDEOS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectSample(sample.url)}
            className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-indigo-500/30 text-slate-300 hover:text-white transition-colors"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
};
