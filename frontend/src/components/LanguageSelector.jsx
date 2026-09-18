import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n';

export default function LanguageSelector({ variant = 'dark' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLangCode = i18n.language ? i18n.language.split('-')[0] : 'en';
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLight = variant === 'light';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer select-none border ${
          isLight
            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-2xs'
            : 'bg-white/10 hover:bg-white/20 text-white border-white/20 shadow-xs'
        }`}
        title="Change Website Language / भाषा बदलें"
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5 text-teal-300" />
        <span className="font-bold">{currentLang.nativeLabel}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Language Selection Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-[70] animate-fade-in text-slate-800">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Select Language
            </span>
            <span className="text-[9px] font-bold bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded border border-teal-200">
              22 Scheduled
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1 divide-y divide-slate-50">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLangCode;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 text-teal-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">{lang.nativeLabel}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({lang.label})</span>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1 border-t border-slate-100 bg-slate-50 text-[10px] text-slate-400 text-center">
            Zero-latency local multilingual engine
          </div>
        </div>
      )}
    </div>
  );
}
