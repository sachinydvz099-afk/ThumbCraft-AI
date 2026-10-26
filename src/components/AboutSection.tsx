import React from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  Download, 
  Layers, 
  AlertTriangle 
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const faqs = [
    {
      q: 'How does ThumbCraft AI download YouTube thumbnails?',
      a: 'YouTube automatically generates and caches public thumbnail images on its CDN (img.youtube.com) whenever a video is uploaded. ThumbCraft AI retrieves these original resolution files directly in your browser without requiring a backend server.'
    },
    {
      q: 'Why are some MaxRes (1080p / 720p) thumbnails unavailable?',
      a: 'YouTube only provides maxresdefault.jpg (1280×720) if the creator uploaded a high-definition video with a custom high-resolution thumbnail. For standard or older videos, YouTube returns a 120×90 placeholder. ThumbCraft AI automatically detects this and gracefully falls back to the highest verified resolution (such as HQ 480×360 or MQ 320×180).'
    },
    {
      q: 'Is ThumbCraft AI completely free? Do I need to create an account?',
      a: 'Yes, 100% free and open. No account, sign-up, credit card, or personal information is required. You can download and create as many thumbnails as you need.'
    },
    {
      q: 'How does the AI Thumbnail Generator work on static hosting?',
      a: 'Because ThumbCraft AI is hosted as a static web application on GitHub Pages, we never bundle or expose private backend secrets. Instead, we provide an interchangeable provider adapter: by default, it uses a free public AI engine (Pollinations Flux) that requires zero API keys. You can also connect your own custom serverless proxy or bring your own OpenAI API key.'
    },
    {
      q: 'What is the Thumbnail Enhancement Studio?',
      a: 'The Studio is a fast, browser-based HTML5 Canvas graphics editor. You can take any downloaded YouTube thumbnail, user-uploaded image, or AI-generated artwork, and add bold headlines, catchphrases, sticker badges, color tints, and dark gradients to make your thumbnail stand out.'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10 py-6">
      
      {/* Overview Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#111827] border border-white/10 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white font-display">About ThumbCraft AI</h2>
            <p className="text-xs text-slate-400">Turn YouTube Links into Thumbnails. Create Better Ones with AI.</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          ThumbCraft AI was designed as a production-quality mini SaaS for creators, designers, marketers, and researchers.
          It combines three essential workflows into one seamless interface: instant high-resolution YouTube thumbnail fetching,
          prompt-to-artwork AI generation, and a client-side graphics studio for adding high-conversion typography and overlays.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <Download className="w-4 h-4 text-indigo-400 mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">Instant Downloader</h4>
            <p className="text-[11px] text-slate-400">Verifies 5 resolution tiers directly against YouTube CDN.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <Sparkles className="w-4 h-4 text-purple-400 mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">AI Generator</h4>
            <p className="text-[11px] text-slate-400">Prompt-driven designs with styles for Gaming, Tech, Finance & more.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <Layers className="w-4 h-4 text-pink-400 mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">Studio Editor</h4>
            <p className="text-[11px] text-slate-400">100% in-browser Canvas editor for headlines, shadows, and badges.</p>
          </div>
        </div>
      </div>

      {/* Licensing, Copyright & Safe Reuse Notice (MANDATORY REQUIREMENT) */}
      <div className="p-6 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 text-slate-300 space-y-3">
        <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Notice Regarding Thumbnail Ownership and Fair Use</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Thumbnails retrieved through ThumbCraft AI are the intellectual property of their respective video creators and copyright holders.
          Downloading a public thumbnail is intended for personal reference, research, archival, and fair-use commentary.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Before reusing, publishing, or modifying someone else's thumbnail for your own channel or commercial projects, please ensure you have proper authorization or express permission from the copyright owner. ThumbCraft AI does not claim ownership over any retrieved YouTube content.
        </p>
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white font-display">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="p-4 sm:p-5 rounded-xl bg-[#111827] border border-white/[0.06] space-y-1.5"
            >
              <h4 className="text-sm font-semibold text-white">{faq.q}</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
