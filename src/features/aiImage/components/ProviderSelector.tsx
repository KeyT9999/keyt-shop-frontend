import { PROVIDER_LABELS } from '../constants';
import { CAPABILITIES } from '../services/providerRegistry';
import type { AiProvider } from '../types';

const PROVIDERS: AiProvider[] = ['gemini', 'openai', 'deepseek'];

interface Props {
  value: AiProvider;
  onChange: (p: AiProvider) => void;
  /** provider nào đã có key (hiện chấm xanh) */
  hasKey: Partial<Record<AiProvider, boolean>>;
}

export default function ProviderSelector({ value, onChange, hasKey }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROVIDERS.map((provider) => {
        const caps = CAPABILITIES[provider];
        const active = value === provider;
        return (
          <button
            key={provider}
            onClick={() => onChange(provider)}
            className={`relative rounded-lg border px-3 py-2 text-left text-sm transition ${
              active
                ? 'border-orange-600 bg-orange-50 text-orange-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <span
                className={`inline-block h-2 w-2 rounded-full ${hasKey[provider] ? 'bg-green-500' : 'bg-slate-300'}`}
                title={hasKey[provider] ? 'Đã có key' : 'Chưa có key'}
              />
              {PROVIDER_LABELS[provider]}
            </span>
            <span className="mt-0.5 block text-[11px] font-normal text-slate-400">
              {caps.vision ? 'Ảnh + chữ' : 'Chỉ chữ (không nhận ảnh)'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
