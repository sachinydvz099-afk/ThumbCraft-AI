import { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Hero } from './components/Hero';
import { UrlInput, UploadedFilePayload } from './components/UrlInput';
import { ThumbnailPreview } from './components/ThumbnailPreview';
import { ResolutionSelector } from './components/ResolutionSelector';
import { AiGenerator } from './components/AiGenerator';
import { ThumbnailEditor } from './components/ThumbnailEditor';
import { FaceSwapStudio } from './components/FaceSwapStudio';
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
import { ArrowUpRight, Upload, Smile, Download, SlidersHorizontal, Sparkles } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('downloader');

  // Downloader state
  const [videoId, setVideoId] = useState<string | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState<string | undefined>(undefined);
  const [selectedKey, setSelectedKey] = useState<ResolutionKey>('maxres');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<UploadedFilePayload | null>(null);
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

  // Studio & Face Swap transfer state
  const [editorInitialImage, setEditorInitialImage] = useState<string | null>(null);
  const [faceSwapInitialImage, setFaceSwapInitialImage] = useState<string | null>(null);

  // Search handler
  const handleSearch = async (newVideoId: string, url?: string) => {
    setUploadedThumbnail(null); // clear uploaded file when searching YouTube
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

  const handleSendToFaceSwap = (imageUrl: string) => {
    setFaceSwapInitialImage(imageUrl);
    setActiveTab('faceswap');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendToAi = () => {
    setActiveTab('generator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = (payload: UploadedFilePayload) => {
    setUploadedThumbnail(payload);
    setVideoId(null);
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
        
        {/* TAB 1: Downloader & File Uploader */}
        {activeTab === 'downloader' && (
          <div className="space-y-10">
            <Hero
              onQuickDownload={() => {
                const el = document.getElementById('youtube-url-input');
                el?.focus();
              }}
              onExploreAi={() => setActiveTab('generator')}
              onOpenEditor={() => setActiveTab('editor')}
              onOpenFaceSwap={() => setActiveTab('faceswap')}
            />

            {/* URL & File Upload Input Box */}
            <UrlInput 
              onSearch={handleSearch} 
              onFileUpload={handleFileUpload}
              isLoading={isLoading} 
            />

            {/* Uploaded File Preview Card */}
            {uploadedThumbnail && (
              <div className="w-full bg-[#111827] rounded-2xl border border-white/10 p-5 sm:p-7 shadow-2xl animate-fadeIn space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white font-display truncate max-w-sm sm:max-w-md">
                        {uploadedThumbnail.fileName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        {uploadedThumbnail.width} &times; {uploadedThumbnail.height} px &middot; {(uploadedThumbnail.sizeBytes / (1024 * 1024)).toFixed(2)} MB &middot; Uploaded Image
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setUploadedThumbnail(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    Clear Upload
                  </button>
                </div>

                {/* Uploaded Image Preview */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 shadow-inner flex items-center justify-center">
                  <img
                    src={uploadedThumbnail.dataUrl}
                    alt={uploadedThumbnail.fileName}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-200 flex items-center gap-2">
                    <span className="font-semibold text-indigo-400">Custom Upload</span>
                    <span className="text-slate-400">&bull;</span>
                    <span>{uploadedThumbnail.width} &times; {uploadedThumbnail.height} px</span>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.download = uploadedThumbnail.fileName || 'thumbnail.png';
                        link.href = uploadedThumbnail.dataUrl;
                        link.click();
                      }}
                      className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 shadow-md shadow-indigo-600/30 transition-all active:scale-95 w-full sm:w-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Image</span>
                    </button>

                    <button
                      onClick={() => handleSendToFaceSwap(uploadedThumbnail.dataUrl)}
                      className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-pink-300 hover:text-pink-200 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 transition-all active:scale-95 w-full sm:w-auto"
                    >
                      <Smile className="w-4 h-4 text-pink-400" />
                      <span>Swap Face in Studio</span>
                    </button>

                    <button
                      onClick={() => handleSendToEditor(uploadedThumbnail.dataUrl)}
                      className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-slate-200 bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 hover:border-white/20 transition-all active:scale-95 w-full sm:w-auto"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                      <span>Edit in Studio</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSendToAi}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all active:scale-95 w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Generate AI Variations</span>
                  </button>
                </div>
              </div>
            )}

            {/* YouTube Thumbnail Results Section */}
            {videoId && selectedOption && (
              <div className="space-y-8 animate-fadeIn pt-4">
                <ThumbnailPreview
                  videoId={videoId}
                  canonicalUrl={canonicalUrl}
                  selectedOption={selectedOption}
                  availability={availability}
                  onSendToEditor={handleSendToEditor}
                  onSendToAi={handleSendToAi}
                  onSendToFaceSwap={handleSendToFaceSwap}
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

        {/* TAB 2: Face Swap Studio */}
        {activeTab === 'faceswap' && (
          <div className="animate-fadeIn">
            <FaceSwapStudio
              initialBaseUrl={faceSwapInitialImage}
              onSendToEditor={handleSendToEditor}
            />
          </div>
        )}

        {/* TAB 3: AI Generator */}
        {activeTab === 'generator' && (
          <div className="animate-fadeIn">
            <AiGenerator
              providerConfig={providerConfig}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onSendToEditor={handleSendToEditor}
              onSendToFaceSwap={handleSendToFaceSwap}
            />
          </div>
        )}

        {/* TAB 4: Studio Editor */}
        {activeTab === 'editor' && (
          <div className="animate-fadeIn">
            <ThumbnailEditor initialImageUrl={editorInitialImage} />
          </div>
        )}

        {/* TAB 5: About & FAQ */}
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
              href="https://github.com/sachinydvz099-afk/ThumbCraft-AI"
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
