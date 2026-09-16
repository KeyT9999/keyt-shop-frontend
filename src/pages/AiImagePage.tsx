import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Frame, KeyRound, MessageSquareText, Scissors, ShieldCheck, Wand2 } from 'lucide-react';
import ApiKeyPanel from '../features/aiImage/components/ApiKeyPanel';
import BgRemovalTab from '../features/aiImage/components/BgRemovalTab';
import CaptionTab from '../features/aiImage/components/CaptionTab';
import FrameSuggestTab from '../features/aiImage/components/FrameSuggestTab';
import ImageDropzone from '../features/aiImage/components/ImageDropzone';
import MetadataTab from '../features/aiImage/components/MetadataTab';
import ProviderSelector from '../features/aiImage/components/ProviderSelector';
import { assertValidImageFile, prepareImageForAi } from '../features/aiImage/services/imagePrep';
import type { AiProvider, PreparedImage } from '../features/aiImage/types';
import { getAllProviderKeys, getProviderKey } from '../utils/aiProviderKeys';

type TabKey = 'caption' | 'frame' | 'bg' | 'metadata';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'caption', label: 'Caption AI', icon: <MessageSquareText size={16} /> },
  { key: 'frame', label: 'Gợi ý khung', icon: <Frame size={16} /> },
  { key: 'bg', label: 'Xóa nền', icon: <Scissors size={16} /> },
  { key: 'metadata', label: 'Metadata AI', icon: <ShieldCheck size={16} /> },
];

export default function AiImagePage() {
  const [provider, setProvider] = useState<AiProvider>(() => {
    const keys = getAllProviderKeys();
    // Ưu tiên provider đã có key
    if (keys.gemini) return 'gemini';
    if (keys.openai) return 'openai';
    if (keys.deepseek) return 'deepseek';
    return 'gemini';
  });
  const [keysVersion, setKeysVersion] = useState(0);
  const [keyPanelOpen, setKeyPanelOpen] = useState(() => !getProviderKey('gemini') && !getProviderKey('openai') && !getProviderKey('deepseek'));

  const [file, setFile] = useState<File | null>(null);
  const [prepared, setPrepared] = useState<PreparedImage | null>(null);
  const [prepError, setPrepError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('caption');

  // keysVersion tăng khi ApiKeyPanel lưu/xóa key — đọc lại từ localStorage
  const keyMap = getAllProviderKeys();
  const apiKey = getProviderKey(provider);
  void keysVersion;

  useEffect(() => {
    document.title = 'AI Xử Lý Ảnh — Caption, Gợi Ý Khung, Xóa Nền | Mindora AI';
  }, []);

  const handleSelectFile = async (selected: File) => {
    setPrepError(null);
    try {
      assertValidImageFile(selected);
      setFile(selected);
      setPrepared(null);
      const prep = await prepareImageForAi(selected);
      setPrepared(prep);
    } catch (e: any) {
      setFile(null);
      setPrepared(null);
      setPrepError(e?.message || 'Không đọc được ảnh này.');
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPrepared(null);
    setPrepError(null);
  };

  return (
    <div className="min-h-[80vh] bg-[#fdfbf7] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 text-center">
          <h1 className="mb-2 flex items-center justify-center gap-2 text-2xl font-bold text-slate-800 sm:text-3xl">
            <Wand2 className="text-orange-600" /> AI Xử Lý Ảnh
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-500">
            Caption ảnh, gợi ý khung Photo Frame, xóa nền và kiểm tra metadata AI. Chỉ cần dán API key{' '}
            <b>Gemini</b>, <b>OpenAI</b> hoặc <b>DeepSeek</b> của bạn — riêng xóa nền Local dùng miễn phí không cần key.
          </p>
        </header>

        {/* Provider + Key */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ProviderSelector
              value={provider}
              onChange={setProvider}
              hasKey={{ gemini: !!keyMap.gemini, openai: !!keyMap.openai, deepseek: !!keyMap.deepseek }}
            />
            <button
              onClick={() => setKeyPanelOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <KeyRound size={15} />
              API Keys
              {keyPanelOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
          {keyPanelOpen && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <ApiKeyPanel onKeysChanged={() => setKeysVersion((v) => v + 1)} />
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Cột trái: ảnh */}
          <div className="lg:col-span-2">
            <ImageDropzone
              previewUrl={prepared?.dataUrl || null}
              fileName={file?.name}
              onSelect={handleSelectFile}
              onClear={handleClearFile}
            />
            {file && !prepared && !prepError && (
              <p className="mt-2 text-xs text-slate-400">Đang chuẩn bị ảnh...</p>
            )}
            {prepError && (
              <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-600">{prepError}</p>
            )}
            {prepared && (
              <p className="mt-2 text-xs text-slate-400">
                Ảnh gửi lên AI được thu nhỏ còn {prepared.width}×{prepared.height}px để tiết kiệm token (~vài trăm token/ảnh).
              </p>
            )}
          </div>

          {/* Cột phải: tabs */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    activeTab === tab.key ? 'bg-orange-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              {activeTab === 'caption' && (
                <CaptionTab provider={provider} apiKey={apiKey} image={prepared} onRequestKey={() => setKeyPanelOpen(true)} />
              )}
              {activeTab === 'frame' && (
                <FrameSuggestTab provider={provider} apiKey={apiKey} image={prepared} file={file} onRequestKey={() => setKeyPanelOpen(true)} />
              )}
              {activeTab === 'bg' && (
                <BgRemovalTab provider={provider} apiKey={apiKey} image={prepared} file={file} onRequestKey={() => setKeyPanelOpen(true)} />
              )}
              {activeTab === 'metadata' && <MetadataTab file={file} />}
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          Ảnh của bạn chỉ rời trình duyệt khi bạn chủ động gọi AI bằng key của chính mình — website không lưu ảnh hay key.
        </footer>
      </div>
    </div>
  );
}
