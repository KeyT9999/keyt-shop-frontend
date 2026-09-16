import { useState } from 'react';
import { Check, Eye, EyeOff, ExternalLink, KeyRound, Trash2 } from 'lucide-react';
import { useAuthContext } from '../../../context/useAuthContext';
import { profileService } from '../../../services/profileService';
import { clearProviderKey, getAllProviderKeys, saveProviderKey } from '../../../utils/aiProviderKeys';
import { saveGeminiApiKey as saveLegacyGeminiKey, clearGeminiApiKey as clearLegacyGeminiKey } from '../../../utils/geminiApiKey';
import { PROVIDER_KEY_HELP, PROVIDER_LABELS } from '../constants';
import type { AiProvider } from '../types';

const PROVIDERS: AiProvider[] = ['gemini', 'openai', 'deepseek'];

interface Props {
  /** gọi khi key thay đổi để parent refresh state */
  onKeysChanged: () => void;
}

export default function ApiKeyPanel({ onKeysChanged }: Props) {
  const { token } = useAuthContext();
  const [inputs, setInputs] = useState<Record<AiProvider, string>>(() => {
    const map = getAllProviderKeys();
    return { gemini: map.gemini || '', openai: map.openai || '', deepseek: map.deepseek || '' };
  });
  const [visible, setVisible] = useState<Record<AiProvider, boolean>>({ gemini: false, openai: false, deepseek: false });
  const [savedFlash, setSavedFlash] = useState<AiProvider | null>(null);

  const handleSave = async (provider: AiProvider) => {
    const key = inputs[provider].trim();
    if (!key) {
      handleClear(provider);
      return;
    }
    saveProviderKey(provider, key);

    if (provider === 'gemini') {
      // Giữ đồng bộ với YouTube Summarizer (key cũ) + profile nếu đăng nhập
      saveLegacyGeminiKey(key);
      if (token) {
        try {
          await profileService.saveGeminiApiKey(key);
        } catch (e) {
          console.warn('Không đồng bộ được key lên profile (bỏ qua):', e);
        }
      }
    }

    setSavedFlash(provider);
    setTimeout(() => setSavedFlash(null), 1500);
    onKeysChanged();
  };

  const handleClear = (provider: AiProvider) => {
    clearProviderKey(provider);
    if (provider === 'gemini') clearLegacyGeminiKey();
    setInputs((prev) => ({ ...prev, [provider]: '' }));
    onKeysChanged();
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Key được lưu ngay trên trình duyệt của bạn và gửi thẳng tới nhà cung cấp AI — website không thu thập key.
        Không lưu key trên máy tính công cộng.
      </p>
      {PROVIDERS.map((provider) => (
        <div key={provider} className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
              <KeyRound size={14} className="text-slate-400" />
              {PROVIDER_LABELS[provider]}
            </span>
            <a
              href={PROVIDER_KEY_HELP[provider].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              {PROVIDER_KEY_HELP[provider].label} <ExternalLink size={12} />
            </a>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={visible[provider] ? 'text' : 'password'}
                value={inputs[provider]}
                onChange={(e) => setInputs((prev) => ({ ...prev, [provider]: e.target.value }))}
                placeholder={`Dán ${PROVIDER_LABELS[provider]} API key...`}
                className="w-full rounded-md border border-slate-300 px-3 py-2 pr-9 text-sm focus:border-orange-500 focus:outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setVisible((prev) => ({ ...prev, [provider]: !prev[provider] }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                title={visible[provider] ? 'Ẩn key' : 'Hiện key'}
              >
                {visible[provider] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={() => handleSave(provider)}
              className="rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              {savedFlash === provider ? <Check size={16} /> : 'Lưu'}
            </button>
            {inputs[provider] && (
              <button
                onClick={() => handleClear(provider)}
                className="rounded-md border border-slate-300 px-2.5 py-2 text-slate-500 hover:bg-slate-50 hover:text-red-600"
                title="Xóa key"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
