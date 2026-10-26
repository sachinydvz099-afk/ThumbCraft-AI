import React, { useState } from 'react';
import { 
  Sparkles, 
  Download, 
  Wand2, 
  SlidersHorizontal, 
  HelpCircle, 
  Menu, 
  X, 
  Github, 
  Settings2 
} from 'lucide-react';
import { ProviderConfig } from '../services/imageGeneration';

interface NavbarProps {
  activeTab: 'downloader' | 'generator' | 'editor' | 'about';
  setActiveTab: (tab: 'downloader' | 'generator' | 'editor' | 'about') => void;
  providerConfig: ProviderConfig;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  providerConfig,
  onOpenSettings,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'downloader', label: 'Downloader', icon: Download },
    { id: 'generator', label: 'AI Generator', icon: Wand2 },
    { id: 'editor', label: 'Studio Editor', icon: SlidersHorizontal },
    { id: 'about', label: 'About & Help', icon: HelpCircle },
  ] as const;

  const handleNavClick = (tabId: 'downloader' | 'generator' | 'editor' | 'about') => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0a0d14]/85 border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('downloader')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 p-[1.5px] shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <div className="w-full h-full bg-[#0a0d14] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
                  ThumbCraft<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"> AI</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden md:block">
                YouTube Thumbnail Downloader & AI Studio
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* AI Provider Status Pill & Settings */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] text-slate-300 hover:text-white transition-colors"
              title="Configure AI Generator Provider Settings"
            >
              <span className={`w-2 h-2 rounded-full ${
                providerConfig.type === 'unconfigured' 
                  ? 'bg-amber-400 animate-pulse' 
                  : 'bg-emerald-400'
              }`} />
              <span>
                {providerConfig.type === 'pollinations' ? 'Free AI Engine' :
                 providerConfig.type === 'custom-proxy' ? 'Custom Proxy' :
                 providerConfig.type === 'openai-compatible' ? 'OpenAI Direct' : 'Provider: Unset'}
              </span>
              <Settings2 className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-white/10"
              aria-label="Settings"
            >
              <Settings2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 border border-white/10"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#0c101b] px-4 pt-3 pb-5 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 text-indigo-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSettings();
              }}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
            >
              <Settings2 className="w-4 h-4 text-indigo-400" />
              <span>AI Provider Settings</span>
            </button>
            <span className="text-xs text-slate-500">100% Client-Side Ready</span>
          </div>
        </div>
      )}
    </header>
  );
};
