import React, { useEffect, useState } from 'react';
import { X, Check, Copy, Sparkles, Smartphone, Share2 } from 'lucide-react';
import { triggerNativeShare } from '../utils/shareApp';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  customText?: string;
  customUrl?: string;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  customText,
  customUrl,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Immediately trigger phone native system share sheet
    triggerNativeShare({
      title: 'СантехПро',
      text: customText,
      url: customUrl,
    }).then((res) => {
      if (res === 'shared' || res === 'dismissed') {
        onClose();
      } else if (res === 'copied') {
        setCopied(true);
        setTimeout(() => {
          onClose();
        }, 2200);
      }
    });
  }, [isOpen, customText, customUrl, onClose]);

  if (!isOpen) return null;

  const shareUrl = customUrl || (typeof window !== 'undefined' ? window.location.origin || 'https://santehpro.info' : 'https://santehpro.info');

  const handleManualCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-md bg-slate-950">
          <img
            src="/santehpro-exchange-banner.jpg"
            alt="СантехПро"
            className="w-full h-28 object-cover object-center"
          />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center justify-center space-x-1.5">
            <span>Поделиться СантехПро</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h3>
          <p className="text-xs text-slate-400">
            {copied ? 'Ссылка успешно скопирована в буфер обмена!' : 'Открытие системного меню телефона...'}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleManualCopy}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Скопировано!' : 'Скопировать прямую ссылку'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
