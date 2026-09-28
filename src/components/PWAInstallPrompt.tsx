import React, { useState } from 'react';
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  CheckCircle2,
  Zap,
  WifiOff,
  Sparkles,
  MoreVertical,
  Laptop,
  Check,
  Loader2,
  FileDown,
  Info,
  ArrowRight,
  Wrench
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BrandLogo3D } from './BrandLogo3D';

/**
 * 3D Metallic App Logo for installation prompts and badges:
 * High-definition rendering of the 3D emblem with roof, wrench, and metallic finish.
 */
const SmallAppLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  if (size === 'lg') {
    return <BrandLogo3D size="sm" showSubtitle={false} className="shrink-0" />;
  }
  if (size === 'sm') {
    return <BrandLogo3D size="xs" showSubtitle={false} className="shrink-0" />;
  }
  return <BrandLogo3D size="xs" showSubtitle={false} className="shrink-0" />;
};

export const PWAInstallPrompt: React.FC = () => {
  const {
    isInstalled,
    isIOS,
    isAndroid,
    isYandex,
    showBanner,
    showGuideModal,
    isPrompting,
    installAttempted,
    installStatusMessage,
    triggerInstall,
    downloadAppShortcut,
    dismissBanner,
    markAsInstalled,
    closeInstallGuide,
  } = usePWAInstall();

  const [activePlatformTab, setActivePlatformTab] = useState<'ios' | 'android' | 'desktop'>(
    isIOS ? 'ios' : 'android'
  );

  // If the app is already installed or marked as installed, completely suppress banner and modals
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Install Banner shown when visiting the website */}
      {showBanner && (
        <aside
          aria-label="Предложение установить мобильное приложение"
          className="fixed bottom-3 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/60 backdrop-blur-xl text-slate-100 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            {/* Close button */}
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Закрыть предложение"
              className="absolute top-3 right-3 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start space-x-3.5">
              {/* App Icon: Small logo with «Сантех» top, «Про» shifted down & right */}
              <SmallAppLogo size="lg" />

              {/* Text Info */}
              <div className="space-y-1 pr-6 flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
                    Установить <span className="text-red-500">Сантех</span><span className="text-blue-500">Про</span>
                  </h3>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    App
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  Установите мобильное приложение на ваш телефон для мгновенного доступа к справочнику и ИИ-диагностике.
                </p>
              </div>
            </div>

            {/* Benefits Checklist */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Быстрый запуск</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <WifiOff className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Офлайн-доступ</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerInstall}
                  disabled={isPrompting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 transition active:scale-[0.98] disabled:opacity-75"
                >
                  {isPrompting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Открываем...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                      <span>Установить</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={dismissBanner}
                  className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                >
                  Позже
                </button>
              </div>

              {/* Explicit option if already installed on the device */}
              <button
                type="button"
                onClick={markAsInstalled}
                className="w-full text-center py-1 text-[11px] text-slate-400 hover:text-cyan-300 transition flex items-center justify-center space-x-1"
                title="Больше не показывать это предложение"
              >
                <Check className="w-3 h-3 text-slate-500" />
                <span>Я уже установил приложение</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Step-by-Step Installation Guide Modal (For Android, iOS, or manual instructions) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden text-slate-100 relative">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center space-x-3">
                <SmallAppLogo size="sm" />
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    Установка приложения
                  </h2>
                  <p className="text-xs text-slate-400">
                    Добавьте <span className="text-red-400 font-bold">Сантех</span><span className="text-blue-400 font-bold">Про</span> на домашний экран
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeInstallGuide}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Platform Selector Tabs */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-around gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActivePlatformTab('android')}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  activePlatformTab === 'android'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android {isYandex ? '(Яндекс)' : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePlatformTab('ios')}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  activePlatformTab === 'ios'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>iPhone / iPad</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePlatformTab('desktop')}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  activePlatformTab === 'desktop'
                    ? 'bg-cyan-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>ПК / Mac</span>
              </button>
            </div>

            {/* Guide Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* 3D App Icon Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 flex items-center space-x-4 shadow-inner">
                <BrandLogo3D size="sm" showSubtitle={false} className="shrink-0" />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm font-black tracking-tight">
                      <span className="text-red-500">Сантех</span>
                      <span className="text-blue-500">Про</span>
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Официальное приложение
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Твой карманный помощник по сантехнике. Работает офлайн без интернета.
                  </p>
                </div>
              </div>

              {/* Dynamic Status / Feedback Message */}
              {installStatusMessage && (
                <div className="p-3.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 text-xs text-cyan-200 shadow-md flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">Статус установки:</p>
                    <p className="text-cyan-200/90 leading-relaxed">{installStatusMessage}</p>
                  </div>
                </div>
              )}

              {activePlatformTab === 'android' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                    <span>
                      {isYandex
                        ? 'Обнаружен Яндекс Браузер на Android. Вы можете запустить системную установку или скачать ярлык:'
                        : 'В Google Chrome или Яндекс Браузере на Android:'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Step 1: Quick Install Action */}
                    <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-extrabold flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <div>
                          <p className="font-bold text-white text-xs sm:text-sm">
                            Нажмите кнопку быстрой установки
                          </p>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Запускает добавление приложения в систему телефона
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={triggerInstall}
                            disabled={isPrompting}
                            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 active:scale-[0.98] text-slate-950 font-black text-xs flex items-center justify-center space-x-1.5 transition shadow-sm"
                          >
                            {isPrompting ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Запуск диалога...</span>
                              </>
                            ) : (
                              <>
                                <Download className="w-3.5 h-3.5" />
                                <span>Начать установку сейчас</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={downloadAppShortcut}
                            title="Скачать файл прямого запуска на телефон"
                            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 border border-slate-700 hover:border-cyan-500/40 text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                          >
                            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Скачать файл запуска</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Browser Menu Installation (Crucial for Yandex Browser) */}
                    <div
                      className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all duration-300 ${
                        installAttempted
                          ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-extrabold flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <p className="font-bold text-white text-xs sm:text-sm">
                            Или через меню браузера
                          </p>
                          <MoreVertical className="w-3.5 h-3.5 text-cyan-400" />
                          {installAttempted && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                              Рекомендуется
                            </span>
                          )}
                        </div>

                        {isYandex ? (
                          <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
                            <p>
                              В <strong>Яндекс Браузере</strong> нажмите <strong>три точки (⋮)</strong> в верхнем или нижнем углу экрана.
                            </p>
                            <p className="flex items-center space-x-1 text-cyan-300">
                              <ArrowRight className="w-3 h-3 shrink-0" />
                              <span>Выберите <strong>«Добавить на главный экран»</strong> или <strong>«Установить на телефон»</strong>.</span>
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Иконка «СантехПро» появится на рабочем столе смартфона и в списке установленных программ.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
                            <p>
                              Нажмите <strong>три точки ⋮</strong> вверху справа и выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Приложение будет загружено и сохранено на ваш смартфон без использования Google Play.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePlatformTab === 'ios' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                    <span>
                      В браузере Safari на iOS установка выполняется в 2 простых шага без App Store:
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-extrabold flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-white flex items-center space-x-1.5">
                          <span>Нажмите кнопку «Поделиться»</span>
                          <Share className="w-3.5 h-3.5 text-cyan-400 inline" />
                        </p>
                        <p className="text-slate-400">
                          Иконка со стрелкой вверх в нижней панели Safari.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-extrabold flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-white flex items-center space-x-1.5">
                          <span>Выберите «На экран "Домой"»</span>
                          <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                        </p>
                        <p className="text-slate-400">
                          Прокрутите список действий вниз и нажмите «На экран "Домой"».
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-extrabold flex items-center justify-center shrink-0">
                        3
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-white">
                          Нажмите «Добавить» в правом верхнем углу
                        </p>
                        <p className="text-slate-400">
                          Иконка приложения появится на главном экране вашего iPhone или iPad!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activePlatformTab === 'desktop' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                    <span>
                      В Google Chrome, Яндекс Браузере или Microsoft Edge на компьютере:
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-extrabold flex items-center justify-center shrink-0">
                        1
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-white flex items-center space-x-1.5">
                          <span>Иконка установки в строке адреса</span>
                        </p>
                        <p className="text-slate-400">
                          В правой части адресной строки браузера нажмите на значок «Установить приложение».
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-extrabold flex items-center justify-center shrink-0">
                        2
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-white">
                          Нажмите «Установить»
                        </p>
                        <p className="text-slate-400">
                          Приложение откроется в отдельном удобном окне и появится в меню пуск/панели задач.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={markAsInstalled}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center space-x-1.5 transition shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Готово, приложение установлено</span>
              </button>

              <button
                type="button"
                onClick={closeInstallGuide}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
