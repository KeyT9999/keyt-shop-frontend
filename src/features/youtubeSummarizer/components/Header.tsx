import React from 'react';
import { Sparkles, Store } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="summarizer-header">
      <div className="summarizer-header__label">
        <div className="summarizer-header__logo">
          <Store size={24} />
        </div>
        <div>
          <h1 className="summarizer-header__title">YouTube Summarizer AI</h1>
        </div>
      </div>
      <div className="summarizer-header__badge">
        <Sparkles size={16} />
        <span>Powered by Gemini 2.5</span>
      </div>
    </header>
  );
};

