import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { UrlInput } from './components/UrlInput';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { ResolutionSelector } from './components/ResolutionSelector';
import { AiGenerator } from './components/AiGenerator';
import { ThumbnailEditor } from './components/ThumbnailEditor';
import { AboutSection } from './components/AboutSection';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, showToast } from './components/Toast';
import { 
  getThumbnailOptions, 
  checkThumbnailImage, 
  ThumbnailCheckResult, 
  ResolutionKey 
} from './services/youtubeThumbnail';
import { 
  loadProviderConfig, 
  ProviderConfig 
} from './services/imageGeneration';
import { ArrowUpRight } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'downloader' | 'generator' | 'editor' | 'about'>('downloader');

  // Downloader state
  const [videoId, setVideoId] = useState<string | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState<string | undefined>(undefined);
  const [selectedKey, setSelectedKey] = useState<ResolutionKey>('maxres');
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<Record<ResolutionKey, ThumbnailCheckResult | null>>({
    maxres: null,
    standard: null,
    high: null,
    medium: null,
    default: null,
  });

  // AI Provider & Settings
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>(loadProviderConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Studio transfer state
  const [editorInitialImage, setEditorInitialImage] = useState<string | null>(null);

  // Search handler
  const handleSearch = async (newVideoId: string, url?: string) => {
    setVideoId(newVideoId);
    setCanonicalUrl(url);
    setIsLoading(true);
    setSelectedKey('maxres');

    // Reset check status
    const initialStatus: Record<ResolutionKey, ThumbnailCheckResult | null> = {
      maxres: null,
      standard: null,
      high: null,
      medium: null,
      default: null,
    };
    setAvailability(initialStatus);

    const options = getThumbnailOptions(newVideoId);

    // Verify all 5 resolutions concurrently
    const promises = options.map(async (opt) => {
      const res = await checkThumbnailImage(opt.url, opt.key);
      return { key: opt.key, result: res };
    });

    const results = await Promise.all(promises);

    const updated: Record<ResolutionKey, ThumbnailCheckResult | null> = { ...initialStatus };
    results.forEach(({ key, result }) => {
      updated[key] = result;
    });

    setAvailability(updated);
    setIsLoading(false);

    // Check if maxres was available; if not, fall back to highest working resolution
    const maxresCheck = updated['maxres'];
    if (!maxresCheck || !maxresCheck.isAvailable) {
      const fallback = options.find((opt) => updated[opt.key]?.isAvailable);
      if (fallback) {
        setSelectedKey(fallback.key);
        showToast({
          type: 'info',
          title: 'MaxRes Unavailable',
          message: `Switched preview to ${fallback.badge} because Maximum Resolution was not uploaded for this video.`,
        });
      }
    } else {
      showToast({
        type: 'success',
        title: 'Thumbnails Retrieved!',
        message: 'MaxRes HD (1080p/720p) is available for this video.',
      });
    }
  };

  const handleSendToEditor = (imageUrl: string) => {
    setEditorInitialImage(imageUrl);
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendToAi = () => {
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const thumbnailOptions = videoId ? getThumbnailOptions(videoId) : [];
  const selectedOption = thumbnailOptions.find((o) => o.key === selectedKey) || thumbnailOptions[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0d14] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        providerConfig={providerConfig}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* TAB 1: Downloader */}
        {activeTab === 'downloader' && (
          <div className="space-y-10">
            <Hero
              onQuickDownload={() => {
                const el = document.getElementById('youtube-url-input');
                el?.focus();
              }}
              onExploreAi={() => setActiveTab('generator')}
              onOpenEditor={() => setActiveTab('editor')}
            />

            {/* URL Input Box */}
            <UrlInput onSearch={handleSearch} isLoading={isLoading} />

            {/* Thumbnail Results Section */}
            {videoId && selectedOption && (
              <div className="space-y-8 animate-fadeIn pt-4">
                <ThumbnailPreview
                  videoId={videoId}
                  canonicalUrl={canonicalUrl}
                  selectedOption={selectedOption}
                  availability={availability}
                  onSendToEditor={handleSendToEditor}
                  onSendToAi={handleSendToAi}
                />

                <ResolutionSelector
                  videoId={videoId}
                  options={thumbnailOptions}
                  availability={availability}
                  selectedKey={selectedKey}
                  onSelectKey={setSelectedKey}
                  onOpenInEditor={handleSendToEditor}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI Generator */}
        {activeTab === 'generator' && (
          <div className="animate-fadeIn">
            <AiGenerator
              providerConfig={providerConfig}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onSendToEditor={handleSendToEditor}
            />
          </div>
        )}

        {/* TAB 3: Studio Editor */}
        {activeTab === 'editor' && (
          <div className="animate-fadeIn">
            <ThumbnailEditor initialImageUrl={editorInitialImage} />
          </div>
        )}

        {/* TAB 4: About & FAQ */}
        {activeTab === 'about' && (
          <div className="animate-fadeIn">
            <AboutSection />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.08] bg-[#0c101b] py-8 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-display">ThumbCraft AI</span>
            <span>&middot;</span>
            <span>Turn YouTube Links into Thumbnails. Create Better Ones with AI.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('about')}
              className="hover:text-white transition-colors"
            >
              Legal & Fair Use
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-white transition-colors"
            >
              AI Settings
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pt-4 border-t border-white/[0.04] text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Disclaimer: ThumbCraft AI is not affiliated with, endorsed, or sponsored by YouTube or Google LLC.
          </p>
          <p>
            100% Client-Side Ready &middot; Deployable on GitHub Pages
          </p>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={providerConfig}
        onSave={setProviderConfig}
      />

      {/* Global Toast Container */}
      <ToastContainer />
    </div>
  );
}

export default App;
