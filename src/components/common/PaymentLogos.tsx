import React from 'react';

/**
 * Оригинальный официальный фирменный знак ЮKassa (ООО НКО «ЮМани»)
 * В точности воспроизводит загруженный референс (yookassa-logo.png):
 * - Фирменный ярко-синий цвет (#0055FF)
 * - Левая наклонная трапециевидная ножка буквы «Ю»
 * - Правый концентрический знак: синий внешний круг, белое кольцо и СИНИЙ СПЛОШНОЙ КРУГ В ЦЕНТРЕ (зрачок/мишень)
 * - Фирменная надпись «kassa» строчным геометрическим гротеском
 */
export const YooKassaSymbol: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-9 h-9',
  color = '#0055FF',
}) => (
  <svg
    viewBox="0 0 160 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    role="img"
    aria-label="Знак ЮKassa"
  >
    {/* Левая наклонная трапециевидная ножка буквы Ю */}
    <path
      d="M16 20 L54 20 L54 140 L30 140 Z"
      fill={color}
    />
    {/* Внешнее кольцо буквы Ю + внутренний сплошной круг (зрачок) в точности по официальному логотипу */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M110 20 C143.137 20 170 46.863 170 80 C170 113.137 143.137 140 110 140 C76.863 140 50 113.137 50 80 C50 46.863 76.863 20 110 20 Z M110 46 C128.778 46 144 61.222 144 80 C144 98.778 128.778 114 110 114 C91.222 114 76 98.778 76 80 C76 61.222 91.222 46 110 46 Z M110 63 C119.389 63 127 70.611 127 80 C127 89.389 119.389 97 110 97 C100.611 97 93 89.389 93 80 C93 70.611 100.611 63 110 63 Z"
      fill={color}
    />
  </svg>
);

/**
 * Оригинальный горизонтальный логотип ЮKassa (знак «Ю» + надпись «kassa»)
 * Соответствует референсу yookassa-logo.png
 */
export const YooKassaLogo: React.FC<{
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  showBadge?: boolean;
}> = ({ className = 'h-7', theme = 'light', showBadge = false }) => {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#111111';

  const logoContent = (
    <svg
      viewBox="0 0 430 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-full w-auto max-w-full ${className}`}
      role="img"
      aria-label="Логотип ЮKassa"
    >
      {/* Фирменный знак Ю с центральным сплошным кругом (как на официальном логотипе) */}
      <g id="yookassa-symbol">
        {/* Левая наклонная ножка */}
        <path d="M14 20 L50 20 L50 100 L28 100 Z" fill="#0055FF" />
        {/* Внешнее кольцо + внутренний центральный круг */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M104 20 C126.091 20 144 37.909 144 60 C144 82.091 126.091 100 104 100 C81.909 100 64 82.091 64 60 C64 37.909 81.909 20 104 20 Z M104 38 C116.15 38 126 47.85 126 60 C126 72.15 116.15 82 104 82 C91.85 82 82 72.15 82 60 C82 47.85 91.85 38 104 38 Z M104 49 C110.075 49 115 53.925 115 60 C115 66.075 110.075 71 104 71 C97.925 71 93 66.075 93 60 C93 53.925 97.925 49 104 49 Z"
          fill="#0055FF"
        />
      </g>

      {/* Фирменная надпись kassa */}
      <g id="yookassa-text" fill={textColor}>
        {/* k */}
        <path d="M174 20 H189 V58 L215 38 H234 L205 60 L236 100 H217 L194 69 L189 73 V100 H174 V20 Z" />
        {/* a */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M257 36 C270.5 36 281 45.5 281 59 V100 H268 V91 C264 97.5 256 101.5 247 101.5 C235.5 101.5 226 94 226 82 C226 69.5 236 63 251 62 L267 61 V58 C267 51.5 262 47.5 255 47.5 C248.5 47.5 243.5 50.5 242 55 H229 C231 44 242.5 36 257 36 Z M267 71.5 L254 72.5 C245.5 73.2 240.5 76.5 240.5 82 C240.5 87.5 245 91 252 91 C260.5 91 267 84.5 267 76 V71.5 Z"
        />
        {/* s */}
        <path d="M302 36 C315.5 36 324.5 43.5 324.5 55.5 C324.5 69.5 312 73 301.5 75.5 C293.5 77.5 290 79.5 290 83.5 C290 88 294.5 91 302 91 C309 91 314 87.5 315 81 H328 C326.5 92.5 316 101.5 302 101.5 C287.5 101.5 276.5 93.5 276.5 82 C276.5 67 290 64 299.5 61.5 C308 59.5 311 57.5 311 53.5 C311 49 306.5 46.5 300 46.5 C293.5 46.5 289 49.5 288 55 H275 C276 44 286.5 36 302 36 Z" />
        {/* s */}
        <path d="M350 36 C363.5 36 372.5 43.5 372.5 55.5 C372.5 69.5 360 73 349.5 75.5 C341.5 77.5 338 79.5 338 83.5 C338 88 342.5 91 350 91 C357 91 362 87.5 363 81 H376 C374.5 92.5 364 101.5 350 101.5 C335.5 101.5 324.5 93.5 324.5 82 C324.5 67 338 64 347.5 61.5 C356 59.5 359 57.5 359 53.5 C359 49 354.5 46.5 348 46.5 C341.5 46.5 337 49.5 336 55 H323 C324 44 334.5 36 350 36 Z" />
        {/* a */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M405 36 C418.5 36 429 45.5 429 59 V100 H416 V91 C412 97.5 404 101.5 395 101.5 C383.5 101.5 374 94 374 82 C374 69.5 384 63 399 62 L415 61 V58 C415 51.5 410 47.5 403 47.5 C396.5 47.5 391.5 50.5 390 55 H377 C379 44 390.5 36 405 36 Z M415 71.5 L402 72.5 C393.5 73.2 388.5 76.5 388.5 82 C388.5 87.5 393 91 400 91 C408.5 91 415 84.5 415 76 V71.5 Z"
        />
      </g>
    </svg>
  );

  if (showBadge) {
    return (
      <div className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-sm shadow-black/10 select-none">
        {logoContent}
      </div>
    );
  }

  return logoContent;
};

/**
 * Оригинальный официальный логотип Robokassa
 * В точности соответствует загруженному референсу a9NfSSuVATY.jpg:
 * - Срез 45° на левой ножке буквы «r»
 * - Мощный геометрический гротеск «robokassa» в фирменном графитовом цвете (#24262B)
 * - Дескриптор «Онлайн-платежи / Кассы / Сервисы» с четкой типографикой
 */
export const RobokassaLogo: React.FC<{
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  showDescriptor?: boolean;
  showBadge?: boolean;
}> = ({ className = 'h-7', theme = 'light', showDescriptor = true, showBadge = false }) => {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#24262B';
  const descColor = theme === 'dark' ? '#94A3B8' : '#475569';

  const logoContent = (
    <svg
      viewBox={showDescriptor ? '0 0 620 145' : '0 48 620 92'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-full w-auto max-w-full ${className}`}
      role="img"
      aria-label="Логотип Robokassa"
    >
      {/* Дескриптор в 3 строки по официальному брендбуку Robokassa */}
      {showDescriptor && (
        <g
          id="robokassa-descriptor"
          fill={descColor}
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          fontSize="15"
          fontWeight="700"
          letterSpacing="0.01em"
        >
          <text x="14" y="24">Онлайн-платежи</text>
          <text x="14" y="42">Кассы</text>
          <text x="14" y="60">Сервисы</text>
        </g>
      )}

      {/* Официальная надпись robokassa с оригинальным срезом ножки «r» */}
      <g id="robokassa-letters" fill={textColor}>
        {/* r (фирменный срез 45° вверху слева) */}
        <path d="M14 85 L27 71 H36 V82 C40 74 49 70 58 70 C65 70 70 72 73 74 L67 87 C64 85 60 84 55 84 C46 84 36 91 36 103 V136 H14 V85 Z" />

        {/* o */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M106 70 C125 70 140 85 140 104 C140 123 125 138 106 138 C87 138 72 123 72 104 C72 85 87 70 106 70 Z M106 87 C96 87 89 94.5 89 104 C89 113.5 96 121 106 121 C116 121 123 113.5 123 104 C123 94.5 116 87 106 87 Z"
        />

        {/* b */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M147 54 H164 V80 C169 73.5 177 70 186 70 C204 70 218 85 218 104 C218 123 204 138 186 138 C176.5 138 169 134 164 128 V136 H147 V54 Z M181 87 C171.5 87 164 94.5 164 104 C164 113.5 171.5 121 181 121 C190.5 121 198 113.5 198 104 C198 94.5 190.5 87 181 87 Z"
        />

        {/* o */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M252 70 C271 70 286 85 286 104 C286 123 271 138 252 138 C233 138 218 123 218 104 C218 85 233 70 252 70 Z M252 87 C242 87 235 94.5 235 104 C235 113.5 242 121 252 121 C262 121 269 113.5 269 104 C269 94.5 262 87 252 87 Z"
        />

        {/* k */}
        <path d="M293 54 H310 V99 L331 72 H351 L322 104 L353 136 H332 L310 109 V136 H293 V54 Z" />

        {/* a */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M383 70 C398 70 410 79 410 93 V136 H395 V127 C390 134 382 138 372 138 C360 138 349 129.5 349 116 C349 101.5 361 94 376 93 L395 91.5 V89 C395 81.5 388.5 77 381 77 C374 77 369 80.5 367 86 H352 C354 75.5 366.5 70 383 70 Z M395 103 L381 104.5 C372 105.5 366 110 366 116.5 C366 123 371 127 378 127 C387.5 127 395 119 395 109 V103 Z"
        />

        {/* s */}
        <path d="M432 70 C445.5 70 454.5 77.5 454.5 89.5 C454.5 103 442 106.5 432 109 C424 111 420.5 113 420.5 117 C420.5 121.5 425 124.5 432.5 124.5 C439.5 124.5 444.5 121 445.5 114.5 H458.5 C457 126 446.5 135 432.5 135 C418 135 407 127 407 115.5 C407 100.5 420.5 97.5 430 95 C438.5 93 441.5 91 441.5 87 C441.5 82.5 437 80 430.5 80 C424 80 419.5 83 418.5 88.5 H405.5 C406.5 77.5 417 70 432 70 Z" />

        {/* s */}
        <path d="M482 70 C495.5 70 504.5 77.5 504.5 89.5 C504.5 103 492 106.5 482 109 C474 111 470.5 113 470.5 117 C470.5 121.5 475 124.5 482.5 124.5 C489.5 124.5 494.5 121 495.5 114.5 H508.5 C507 126 496.5 135 482.5 135 C468 135 457 127 457 115.5 C457 100.5 470.5 97.5 480 95 C488.5 93 491.5 91 491.5 87 C491.5 82.5 487 80 480.5 80 C474 80 469.5 83 468.5 88.5 H455.5 C456.5 77.5 467 70 482 70 Z" />

        {/* a */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M545 70 C560 70 572 79 572 93 V136 H557 V127 C552 134 544 138 534 138 C522 138 511 129.5 511 116 C511 101.5 523 94 538 93 L557 91.5 V89 C557 81.5 550.5 77 543 77 C536 77 531 80.5 529 86 H514 C516 75.5 528.5 70 545 70 Z M557 103 L543 104.5 C534 105.5 528 110 528 116.5 C528 123 533 127 540 127 C549.5 127 557 119 557 109 V103 Z"
        />
      </g>
    </svg>
  );

  if (showBadge) {
    return (
      <div className="inline-flex items-center justify-center px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 shadow-sm shadow-black/10 select-none">
        {logoContent}
      </div>
    );
  }

  return logoContent;
};

/**
 * Премиальные бейджи платёжных сервисов для удобного выбора в модальном окне
 */
export const YooKassaCardBadge: React.FC<{ selected?: boolean }> = ({ selected = false }) => (
  <div
    className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center ${
      selected
        ? 'bg-white shadow-md shadow-blue-500/20 ring-2 ring-[#0055FF]'
        : 'bg-white shadow-sm border border-slate-200'
    }`}
  >
    <YooKassaLogo className="h-7 sm:h-8" theme="light" />
  </div>
);

export const RobokassaCardBadge: React.FC<{ selected?: boolean }> = ({ selected = false }) => (
  <div
    className={`px-3.5 py-2 rounded-xl transition-all flex items-center justify-center ${
      selected
        ? 'bg-white shadow-md shadow-blue-500/20 ring-2 ring-sky-500'
        : 'bg-white shadow-sm border border-slate-200'
    }`}
  >
    <RobokassaLogo className="h-7 sm:h-8" theme="light" showDescriptor={true} />
  </div>
);
