import React from 'react';

interface BrandLogo3DProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showSubtitle?: boolean;
  className?: string;
}

/**
 * High-Fidelity 3D Metallic Logo for "СантехПро"
 * Reproduces the metallic 3D emblem with:
 * - Brushed dark titanium circular background & lighting
 * - Red house roof peak & blue adjustable plumbing wrench emblem
 * - 3D beveled red metallic chrome text "САНТЕХ"
 * - 3D beveled blue metallic chrome text "ПРО"
 * - Silver metallic subtitle "Твой карманный помощник по сантехнике"
 */
export const BrandLogo3D: React.FC<BrandLogo3DProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  // Dimensions based on size
  const sizeStyles = {
    xs: 'w-10 h-10',
    sm: 'w-14 h-14',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-40 h-40 sm:w-48 sm:h-48',
    xl: 'w-56 h-56 sm:w-64 sm:h-64',
    full: 'w-full h-auto max-w-xs sm:max-w-sm',
  }[size];

  return (
    <div className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 500 500"
        className={`${sizeStyles} drop-shadow-2xl transition-transform duration-300`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Circular brushed titanium background */}
          <radialGradient id="titaniumBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="35%" stopColor="#1e293b" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#090d16" />
          </radialGradient>

          {/* Brushed metal radial highlight */}
          <linearGradient id="metalSheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </linearGradient>

          {/* Red 3D metallic bevel gradient */}
          <linearGradient id="redMetallicBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff8a80" />
            <stop offset="25%" stopColor="#ff1744" />
            <stop offset="60%" stopColor="#d50000" />
            <stop offset="85%" stopColor="#b71c1c" />
            <stop offset="100%" stopColor="#5f0909" />
          </linearGradient>

          {/* Red top highlight */}
          <linearGradient id="redHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ff5252" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d50000" stopOpacity="0" />
          </linearGradient>

          {/* Blue 3D metallic bevel gradient */}
          <linearGradient id="blueMetallicBevel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#82b1ff" />
            <stop offset="25%" stopColor="#2979ff" />
            <stop offset="60%" stopColor="#1565c0" />
            <stop offset="85%" stopColor="#0d47a1" />
            <stop offset="100%" stopColor="#051e4d" />
          </linearGradient>

          {/* Blue top highlight */}
          <linearGradient id="blueHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#448aff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1565c0" stopOpacity="0" />
          </linearGradient>

          {/* 3D Deep drop shadow */}
          <filter id="deep3DShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="#000000" floodOpacity="0.6" />
          </filter>

          {/* Inner bevel filter for metallic chrome effect */}
          <filter id="metallicEmboss" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1.2" specularExponent="20" lightingColor="#ffffff" result="specOut">
              <fePointLight x="250" y="50" z="200" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specIn" />
            <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>
        </defs>

        {/* 1. Background Round Disc */}
        <circle cx="250" cy="250" r="240" fill="url(#titaniumBg)" />
        
        {/* Circular concentric brushed metal rings */}
        <circle cx="250" cy="250" r="238" fill="none" stroke="#475569" strokeWidth="1.5" strokeOpacity="0.4" />
        <circle cx="250" cy="250" r="210" fill="none" stroke="#64748b" strokeWidth="1" strokeOpacity="0.2" />
        <circle cx="250" cy="250" r="170" fill="none" stroke="#334155" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx="250" cy="250" r="120" fill="none" stroke="#64748b" strokeWidth="1" strokeOpacity="0.25" />
        <circle cx="250" cy="250" r="60" fill="none" stroke="#475569" strokeWidth="0.8" strokeOpacity="0.3" />
        
        {/* Metal lighting sheen */}
        <circle cx="250" cy="250" r="240" fill="url(#metalSheen)" />

        {/* 2. Top Emblem: House Roof (Red & Blue) + Adjustable Wrench (Blue) */}
        <g filter="url(#deep3DShadow)" transform="translate(0, -10)">
          {/* Red Roof Slope & Chimney */}
          <path
            d="M250,115 L325,175 L305,175 L285,158 L285,138 L272,128 L250,145 L250,115 Z"
            fill="url(#redMetallicBevel)"
            stroke="#ff5252"
            strokeWidth="1"
          />
          <path
            d="M285,135 L300,135 L300,155 L285,142 Z"
            fill="#d50000"
          />

          {/* Blue Roof Slope & Wrench Body */}
          {/* Blue Left Roof Peak */}
          <path
            d="M250,115 L175,175 L198,175 L250,133 L250,115 Z"
            fill="url(#blueMetallicBevel)"
            stroke="#82b1ff"
            strokeWidth="1"
          />

          {/* 3D Adjustable Wrench in Blue */}
          {/* Wrench Jaw & Head */}
          <path
            d="M170,142 C185,135 198,145 198,155 C198,162 190,168 178,168 L170,168 C162,168 158,160 162,152 C165,146 168,143 170,142 Z"
            fill="url(#blueMetallicBevel)"
            stroke="#82b1ff"
            strokeWidth="1"
          />
          <path
            d="M168,146 L180,146 C186,146 190,150 190,155 C190,160 186,164 180,164 L168,164 Z"
            fill="#090d16"
          />

          {/* Wrench Handle with 3D Bevel */}
          <path
            d="M195,152 L305,152 C312,152 316,158 316,163 C316,168 312,174 305,174 L195,174 Z"
            fill="url(#blueMetallicBevel)"
            stroke="#82b1ff"
            strokeWidth="1.2"
          />
          <path
            d="M198,154 L303,154 C308,154 312,157 312,161 L198,161 Z"
            fill="url(#blueHighlight)"
          />
        </g>

        {/* 3. 3D Beveled Text: САНТЕХ (Metallic Red Chrome) */}
        <g filter="url(#deep3DShadow)">
          {/* Extruded 3D base layers (Dark red depth) */}
          <text
            x="250"
            y="262"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Montserrat', 'Arial Black', sans-serif"
            fontSize="88"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="#3f0505"
          >
            САНТЕХ
          </text>
          <text
            x="250"
            y="259"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Montserrat', 'Arial Black', sans-serif"
            fontSize="88"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="#7f0c0c"
          >
            САНТЕХ
          </text>
          <text
            x="250"
            y="256"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Montserrat', 'Arial Black', sans-serif"
            fontSize="88"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="#b71c1c"
          >
            САНТЕХ
          </text>

          {/* Main 3D Front Face */}
          <text
            x="250"
            y="253"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Montserrat', 'Arial Black', sans-serif"
            fontSize="88"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="url(#redMetallicBevel)"
            stroke="#ff8a80"
            strokeWidth="1.2"
            filter="url(#metallicEmboss)"
          >
            САНТЕХ
          </text>

          {/* Top Edge Gloss Highlight */}
          <text
            x="250"
            y="252"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Montserrat', 'Arial Black', sans-serif"
            fontSize="88"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="none"
            stroke="url(#redHighlight)"
            strokeWidth="1"
          >
            САНТЕХ
          </text>
        </g>

        {/* 4. 3D Beveled Text: ПРО (Metallic Sapphire Blue Chrome) */}
        <g filter="url(#deep3DShadow)">
          {/* Extruded 3D base layers (Dark blue depth) */}
          <text
            x="250"
            y="350"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Montserrat', 'Arial Black', sans-serif"
            fontSize="92"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="#03112a"
          >
            ПРО
          </text>
          <text
            x="250"
            y="347"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Montserrat', 'Arial Black', sans-serif"
            fontSize="92"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="#0d47a1"
          >
            ПРО
          </text>
          <text
            x="250"
            y="344"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Montserrat', 'Arial Black', sans-serif"
            fontSize="92"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="#1565c0"
          >
            ПРО
          </text>

          {/* Main 3D Front Face */}
          <text
            x="250"
            y="341"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Montserrat', 'Arial Black', sans-serif"
            fontSize="92"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="url(#blueMetallicBevel)"
            stroke="#82b1ff"
            strokeWidth="1.2"
            filter="url(#metallicEmboss)"
          >
            ПРО
          </text>

          {/* Top Edge Gloss Highlight */}
          <text
            x="250"
            y="340"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'Montserrat', 'Arial Black', sans-serif"
            fontSize="92"
            fontWeight="900"
            letterSpacing="-1.5"
            fill="none"
            stroke="url(#blueHighlight)"
            strokeWidth="1"
          >
            ПРО
          </text>
        </g>

        {/* 5. Subtitle: Твой карманный помощник по сантехнике */}
        {showSubtitle && (
          <g filter="url(#deep3DShadow)">
            <text
              x="250"
              y="405"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
              fontSize="23"
              fontWeight="700"
              letterSpacing="0.4"
              fill="#cbd5e1"
            >
              Твой карманный
            </text>
            <text
              x="250"
              y="435"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
              fontSize="23"
              fontWeight="700"
              letterSpacing="0.4"
              fill="#cbd5e1"
            >
              помощник по
            </text>
            <text
              x="250"
              y="465"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
              fontSize="23"
              fontWeight="700"
              letterSpacing="0.4"
              fill="#cbd5e1"
            >
              сантехнике
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
