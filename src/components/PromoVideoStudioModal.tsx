import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Film,
  Sparkles,
  Copy,
  Check,
  Share2,
  Video,
  Smartphone,
  ExternalLink,
  Wrench,
  Flame,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Download,
  Info,
  Tv,
} from 'lucide-react';

interface PromoVideoStudioModalProps {
  onClose: () => void;
}

export const PromoVideoStudioModal: React.FC<PromoVideoStudioModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'prompts' | 'storyboard' | 'guide' | 'social'>('prompts');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(true);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const SCENES = [
    {
      id: 'scene-1',
      title: 'Сцена 1: Тревожный вызов на форуме',
      timing: '00:00 – 00:03',
      badge: 'Завязка / Проблема',
      description: 'Крупный план экрана: пост на городском форуме жильцов: «SOS! Срочно сорвало стояк, топит 5 этажей! СантехПро, спасайте!». Мгновенное появление пуш-уведомления СантехПро: «Новый срочный заказ рядом • 8 500 ₽ • Принять». Мастер нажимает кнопку.',
      promptEn: 'Cinematic close-up of a smartphone screen in a workshop, dramatic lighting. A modern community forum app shows an urgent alert in Russian "СантехПро: Срочный вызов! Затопление!", intense glowing red notification. A plumber\'s hand with work gloves taps "Accept Order" on the screen. Depth of field, anamorphic lens, 8k resolution, photorealistic.',
      promptSeedance: 'master plumber receives urgent job notification on mobile app "SantehPro", dramatic camera pan from phone screen to plumber grabbing leather tool bag, cinematic lighting, 4k 60fps',
      cameraMovement: 'Zoom-in на экран телефона → быстрый whip-pan на мастера',
      sfx: 'Звук уведомления push → тревожная нарастающая музыка (action beat)',
    },
    {
      id: 'scene-2',
      title: 'Сцена 2: Эпический забег мастера через город',
      timing: '00:03 – 00:08',
      badge: 'Экшен / Динамика',
      description: 'Прямо как в референсном видео: эпичный динамичный спринт! Мастер в стильной спецовке «СантехПро» с тяжелой сумкой с ключами наперевес мчится через утренний туманный город, перепрыгивает ступени, вбегает в подъезд. Камера на уровне земли и динамичный трекинг сбоку (tracking shot).',
      promptEn: 'Cinematic dynamic tracking shot, low angle, fast pace. A skilled heroic male plumber in a sleek professional navy-blue uniform with "СантехПро" logo on his chest, running at full speed through a foggy city morning holding a heavy heavy-duty plumbing tool bag. Dust and mist flying, intense breath, heroic determination, 35mm film look, motion blur, slow-motion 60fps, epic action movie cinematography.',
      promptSeedance: 'epic slow-motion tracking shot of a plumber running fast across misty streets carrying pipe wrenches and tool kit, heroic cinematic lighting, atmospheric fog, dynamic runner camera angle, realistic 8k',
      cameraMovement: 'Низкий ракурс от земли (Low Angle) → бег на зрителя → вид сбоку в slow-motion',
      sfx: 'Тяжелое дыхание, глухие удары ботинок о землю, звон ключей в сумке, эпический саундтрек',
    },
    {
      id: 'scene-3',
      title: 'Сцена 3: Аварийный прорыв и устранение за секунды',
      timing: '00:08 – 00:12',
      badge: 'Кульминация / Профессионализм',
      description: 'Дверь квартиры распахивается: из лопнувшей трубы под давлением 8 бар бьет мощный фонтан воды в разные стороны. Мастер без страха ныряет к стояку, ловким точным движением накидного ключа перекрывает вентиль и ставит ремонтный хомут. Фонтан гаснет, чистота и порядок.',
      promptEn: 'Dramatic slow-motion cinematic scene in an apartment bathroom. Massive burst water pipe spraying intense water fountain everywhere, water droplets illuminated by cinematic rim light. Plumber in waterproof jacket swiftly lunges forward, perfectly grips a brass ball valve with a heavy Knipex chrome wrench and smoothly shuts it off. Water stops spraying, triumphant steam and droplets in slow-mo, photorealistic 8k.',
      promptSeedance: 'bathroom flooded with water burst fountain, plumber heroically twisting emergency valve with heavy wrench, water spraying stops, dramatic cinematic lighting, water droplets floating in air 4k',
      cameraMovement: 'Сверхзамедленная съемка капель (Hyper Slow-Mo) → фиксация зажатия ключа',
      sfx: 'Шум хлещущей воды → резкий щелчок закрытия крана → тишина и выдох облегчения',
    },
    {
      id: 'scene-4',
      title: 'Сцена 4: Финал и победа в приложении «СантехПро»',
      timing: '00:12 – 00:15',
      badge: 'Развязка / Призыв к действию',
      description: 'Мастер вытирает лоб, улыбается в камеру, достает смартфон. Крупный план: на экране сияет приложение «СантехПро»: статус «Заказ выполнен. Выплата 8 500 ₽ зачислена! Рейтинг 5.0★». Финальный слоган: «СантехПро — проверенные мастера и заказы рядом с тобой! Скачай прямо сейчас».',
      promptEn: 'Heroic smiling plumber wiping sweat, looking directly at camera with confident thumbs up. Plumber holds up smartphone displaying the "СантехПро" app interface showing green checkmark "Заказ выполнен • Оплата получена 8500 ₽". Soft cinematic golden hour lighting, clean blurred background, sharp phone UI display, closing logo animation "СантехПро".',
      promptSeedance: 'smiling professional master showing mobile phone screen with SantehPro app logo and 5-star rating, clean cinematic bokeh background, triumphant corporate logo outro, 4k 60fps',
      cameraMovement: 'Портрет крупным планом → наезд на экран смартфона с логотипом приложения',
      sfx: 'Приятный кассовый джингл («дзынь» зачисления средств) → финальный брендовый аккорд',
    },
  ];

  // Complete master prompt for generating whole 15s sequence
  const FULL_PROMPT_EN = `Cinematic viral promo video trailer for "SantehPro" plumbing app:
[Scene 1] Plumber receives urgent smartphone notification "СантехПро: Срочный вызов!", taps accept.
[Scene 2] Epic cinematic low-angle tracking shot of heroic plumber in navy uniform sprinting fast with heavy toolbag across misty morning streets, dynamic action motion blur, intense focus.
[Scene 3] Flooded room with high-pressure water fountain spraying everywhere, plumber swiftly closes brass ball valve with chrome wrench, water stops instantly.
[Scene 4] Plumber smiles proudly, shows phone screen with "СантехПро" app displaying completed order and payment. Cinematic 35mm film, anamorphic lens, 8k, photorealistic, 60fps.`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-red-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/25 shrink-0">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-black text-white">
                  Промо-студия & AI-Видео «СантехПро»
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 uppercase tracking-wider">
                  Reels • Shorts • Клипы
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Готовые кинематографические промпты для Kling AI, Seedance, Runway, Luma и пошаговый сценарий
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-900/90 flex items-center space-x-2 overflow-x-auto text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('prompts')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'prompts'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Промпты для AI-генераторов</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('storyboard')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'storyboard'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Раскадровка ролика (15 сек)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'guide'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Инструкция по созданию</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'social'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Посты для VK / Telegram</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: PROMPTS */}
          {activeTab === 'prompts' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Master Full Prompt Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">
                      ★
                    </span>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        Главный общий промпт (Full Commercial 15s)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Для генерации всего ролика целиком в Kling AI, Runway Gen-3, Luma Dream Machine, Seedance
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(FULL_PROMPT_EN, 'full-prompt')}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
                  >
                    {copiedKey === 'full-prompt' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'full-prompt' ? 'Скопировано!' : 'Копировать промпт'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-rose-200 font-mono leading-relaxed whitespace-pre-wrap select-all">
                  {FULL_PROMPT_EN}
                </div>
              </div>

              {/* Step-by-step Scenes Prompts */}
              <div className="space-y-4">
                <h4 className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Покадровые промпты по сценам (для генерации кадр за кадром)</span>
                </h4>

                <div className="space-y-3.5">
                  {SCENES.map((scene, idx) => (
                    <div
                      key={scene.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-3"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold text-xs border border-cyan-500/30">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-sm text-white">{scene.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            {scene.timing}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(scene.promptEn, `scene-${idx}`)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1 transition cursor-pointer"
                        >
                          {copiedKey === `scene-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === `scene-${idx}` ? 'Скопировано' : 'Копировать'}</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {scene.description}
                      </p>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 select-all leading-relaxed">
                        {scene.promptEn}
                      </div>

                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <strong>Камера:</strong> {scene.cameraMovement}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          <strong>Звук:</strong> {scene.sfx}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORYBOARD */}
          {activeTab === 'storyboard' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 space-y-1.5">
                <div className="font-extrabold text-white flex items-center space-x-2">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span>Интерактивный симулятор раскадровки (15 секунд)</span>
                </div>
                <p>
                  Нажмите на сцену ниже, чтобы увидеть анимационный скетч и подробное руководство по съемке каждого момента.
                </p>
              </div>

              {/* Scene Tabs Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SCENES.map((sc, i) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setActiveSceneIndex(i)}
                    className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                      activeSceneIndex === i
                        ? 'bg-rose-500/15 border-rose-500/50 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-rose-400 font-bold">{sc.timing}</div>
                    <div className="text-xs font-bold truncate mt-0.5">Сцена {i + 1}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{sc.badge}</div>
                  </button>
                ))}
              </div>

              {/* Active Scene Preview Card */}
              {SCENES[activeSceneIndex] && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                        {SCENES[activeSceneIndex].badge}
                      </span>
                      <h3 className="text-base font-extrabold text-white mt-1">
                        {SCENES[activeSceneIndex].title} ({SCENES[activeSceneIndex].timing})
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed">
                    {SCENES[activeSceneIndex].description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="font-bold text-cyan-400">🎬 Операторская работа:</div>
                      <p className="text-slate-300">{SCENES[activeSceneIndex].cameraMovement}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <div className="font-bold text-amber-400">🔊 Звуковой дизайн (SFX):</div>
                      <p className="text-slate-300">{SCENES[activeSceneIndex].sfx}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(SCENES[activeSceneIndex].promptEn, 'cur-scene')}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-2 transition cursor-pointer"
                    >
                      {copiedKey === 'cur-scene' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey === 'cur-scene' ? 'Скопировано!' : 'Скопировать промпт для этой сцены'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/30 space-y-2">
                <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                  <Video className="w-4 h-4 text-blue-400" />
                  <span>Пошаговый план: Как сделать вирусный AI-ролик за 15 минут</span>
                </h3>
                <p className="text-slate-300">
                  Вы можете создать кинематографичный ролик с собой в главной роли, используя бесплатные нейросети и свой смартфон:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-sm text-cyan-400 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">1</span>
                    <span>Шаг 1: Фотография мастера (Ваше лицо в спецовке)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Сделайте селфи в спецовке или рабочем поло. Загрузите в <strong>Midjourney</strong>, <strong>Flux</strong> или <strong>FaceSwap (Remaker AI)</strong>, чтобы получить кинематографичный базовый кадр бегущего мастера.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-sm text-rose-400 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">2</span>
                    <span>Шаг 2: Оживление видео в нейросети (Image-to-Video)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Откройте <strong>Kling AI (klingai.com)</strong>, <strong>Luma Dream Machine</strong> или <strong>Runway Gen-3</strong>. Загрузите фото, вставьте наш промпт и включите <em>Camera Motion: Dynamic / Fast Track</em>. Нейросеть сгенерирует эпический бег в 60 fps!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-sm text-amber-400 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">3</span>
                    <span>Шаг 3: Музыкальный трек в Suno AI</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Зайдите на <strong>Suno.com</strong> и напишите промпт: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300">epic fast action trailer, dramatic drums, heavy brass, superhero entrance</code>. За 30 секунд у вас будет готовый мощный блокбастерный трек без проблем с авторскими правами.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-bold text-sm text-emerald-400 flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">4</span>
                    <span>Шаг 4: Быстрая сборка в CapCut на телефоне</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Соедините 4 полученных фрагмента в приложении <strong>CapCut</strong> (15 секунд). Наложите звук хлещущей воды, добавьте финальный логотип приложения «СантехПро» и опубликуйте в VK Клипы, Reels и YouTube Shorts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL POSTS */}
          {activeTab === 'social' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h4 className="text-xs font-black tracking-wider uppercase text-slate-400 flex items-center space-x-1.5">
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Готовые тексты постов к видео для VK, Telegram и Авито</span>
              </h4>

              <div className="space-y-3">
                {/* Post 1: For Customers */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Пост 1: Для клиентов (Заказ мастера без посредников)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`Трубу прорвало, а сантехник из ЖЭКа обещает прийти «в течение дня»? 😱

Не рискуйте ремонтом соседей! Открывайте «СантехПро» — проверенные частные мастера рядом с вами приедут за 20-30 минут с полным набором специнструмента. 

🔧 Честная электронная смета ДО начала работ
🛡️ Договор и официальная гарантия
⭐ Реальные отзывы и проверенные паспорта мастеров

📲 Скачать «СантехПро» бесплатно: https://santehpro.info
#сантехник #сантехпро #ремонтсантехники #прорывтрубы #срочныйвызов`, 'post-1')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'post-1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'post-1' ? 'Скопировано' : 'Копировать'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    Трубу прорвало, а сантехник из ЖЭКа обещает прийти «в течение дня»? 😱{'\n\n'}
                    Не рискуйте ремонтом соседей! Открывайте «СантехПро» — проверенные частные мастера рядом с вами приедут за 20-30 минут с полным набором специнструмента.{'\n\n'}
                    🔧 Честная электронная смета ДО начала работ{'\n'}
                    🛡️ Договор и официальная гарантия{'\n'}
                    ⭐ Реальные отзывы и проверенные паспорта мастеров{'\n\n'}
                    📲 Скачать «СантехПро» бесплатно: https://santehpro.info{'\n'}
                    #сантехник #сантехпро #ремонтсантехники #прорывтрубы #срочныйвызов
                  </div>
                </div>

                {/* Post 2: For Masters */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Пост 2: Для мастеров (Присоединяйся к СантехПро)</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`Ты толковый сантехник и хочешь стабильные заказы без грабительских комиссий? 🧰

Регистрируйся в приложении «СантехПро»:
✅ Прямые заявки от клиентов в твоем районе
✅ Электронные сметы и акты прямо в телефоне
✅ Быстрый калькулятор труб, фитингов и закупок
✅ Профиль мастера с твоими фото работ и отзывами

Становись проверенным специалистом уже сегодня: https://santehpro.info
#сантехник #работасантехником #сантехпро #заказысантехнику #мастерначас`, 'post-2')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'post-2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'post-2' ? 'Скопировано' : 'Копировать'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                    Ты толковый сантехник и хочешь стабильные заказы без грабительских комиссий? 🧰{'\n\n'}
                    Регистрируйся в приложении «СантехПро»:{'\n'}
                    ✅ Прямые заявки от клиентов в твоем районе{'\n'}
                    ✅ Электронные сметы и акты прямо в телефоне{'\n'}
                    ✅ Быстрый калькулятор труб, фитингов и закупок{'\n'}
                    ✅ Профиль мастера с твоими фото работ и отзывами{'\n\n'}
                    Становись проверенным специалистом уже сегодня: https://santehpro.info{'\n'}
                    #сантехник #работасантехником #сантехпро #заказысантехнику #мастерначас
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Студия продвижения «СантехПро» • Вирусные промо-ролики</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
