import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  ShieldCheck, 
  Key, 
  Server, 
  Sparkles, 
  Check 
} from 'lucide-react';
import { 
  ProviderConfig, 
  ProviderType, 
  saveProviderConfig 
} from '../services/imageGeneration';
import { showToast } from './Toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ProviderConfig;
  onSave: (newConfig: ProviderConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [providerType, setProviderType] = useState<ProviderType>(config.type);
  const [customEndpoint, setCustomEndpoint] = useState(config.customEndpoint || '');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [modelName, setModelName] = useState(config.modelName || 'flux');

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: ProviderConfig = {
      type: providerType,
      customEndpoint: customEndpoint.trim() || undefined,
      apiKey: apiKey.trim() || undefined,
      modelName: modelName.trim() || undefined,
    };

    saveProviderConfig(updated);
    onSave(updated);
    showToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'AI Provider configuration updated successfully.',
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative max-w-xl w-full bg-[#111827] rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-7 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">AI Provider Configuration</h3>
              <p className="text-xs text-slate-400">Configure or switch the AI thumbnail generation adapter</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Static Hosting Architecture Notice */}
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5 mb-5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-white">Static Hosting Architecture: </span>
            ThumbCraft AI runs securely on static GitHub Pages. Any custom API key you input is stored 
            <span className="font-semibold text-white"> strictly in your browser's localStorage</span> and never exposed publicly or sent to our repository.
          </div>
        </div>

        {/* Provider Option Radio Cards */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Choose Generation Adapter
          </label>

          {/* Option 1: Free Public AI Engine */}
          <div
            onClick={() => setProviderType('pollinations')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              providerType === 'pollinations'
                ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 text-white'
                : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-sm">Free Public AI Adapter (Pollinations Flux)</span>
              </div>
              {providerType === 'pollinations' && <Check className="w-4 h-4 text-purple-400" />}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recommended for static sites. Free, instant generation without requiring private API keys or backend setup.
            </p>
          </div>

          {/* Option 2: Custom Serverless Backend Proxy */}
          <div
            onClick={() => setProviderType('custom-proxy')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              providerType === 'custom-proxy'
                ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 text-white'
                : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-sm">Custom Serverless Proxy Endpoint</span>
              </div>
              {providerType === 'custom-proxy' && <Check className="w-4 h-4 text-indigo-400" />}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect to your external Cloudflare Worker, Vercel Serverless Function, or AWS Lambda proxy.
            </p>
          </div>

          {/* Option 3: OpenAI Direct */}
          <div
            onClick={() => setProviderType('openai-compatible')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              providerType === 'openai-compatible'
                ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 text-white'
                : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-pink-400" />
                <span className="font-bold text-sm">OpenAI / Compatible Endpoint (BYOK)</span>
              </div>
              {providerType === 'openai-compatible' && <Check className="w-4 h-4 text-pink-400" />}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bring Your Own Key for DALL-E 3 or OpenAI-compatible image endpoints (stored locally in browser).
            </p>
          </div>

          {/* Option 4: Unconfigured */}
          <div
            onClick={() => setProviderType('unconfigured')}
            className={`p-3 rounded-xl border cursor-pointer transition-all ${
              providerType === 'unconfigured'
                ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 text-white'
                : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06] text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Unconfigured Mode (Testing status banner)</span>
              {providerType === 'unconfigured' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
          </div>
        </div>

        {/* Dynamic Inputs based on selection */}
        {providerType === 'custom-proxy' && (
          <div className="space-y-3 mb-6 p-4 rounded-xl bg-black/40 border border-white/10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Proxy Endpoint URL <span className="text-pink-400">*</span>
              </label>
              <input
                type="url"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://api.yourdomain.com/generate-thumbnail"
                className="w-full px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Optional Proxy Token / Header
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Bearer token or secret key"
                className="w-full px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {providerType === 'openai-compatible' && (
          <div className="space-y-3 mb-6 p-4 rounded-xl bg-black/40 border border-white/10">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                OpenAI API Key <span className="text-pink-400">*</span>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Custom Endpoint (Optional)
              </label>
              <input
                type="url"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="Default: https://api.openai.com/v1/images/generations"
                className="w-full px-3 py-2 rounded-lg bg-[#0d121f] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
};
