function svgToDataUri(svg) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const DEFAULT_AVATAR = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="avatarBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF2E8"/>
      <stop offset="100%" stop-color="#FFE2D3"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="32" fill="url(#avatarBg)"/>
  <circle cx="60" cy="44" r="22" fill="#FFB287"/>
  <path d="M38 38c5-15 38-15 43 0-4-4-11-7-22-7-10 0-17 3-21 7Z" fill="#FF6B35"/>
  <path d="M24 104c3-22 18-34 36-34s33 12 36 34" fill="#FF6B35"/>
</svg>
`)

const DEFAULT_IMAGE = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="photoBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FFF8F3"/>
      <stop offset="100%" stop-color="#FFEDE4"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" rx="32" fill="url(#photoBg)"/>
  <circle cx="316" cy="64" r="24" fill="#FFD86B"/>
  <path d="M0 224c64-14 118-10 176 18 48 23 95 25 224-4v62H0Z" fill="#FFCFA8"/>
  <path d="M0 244c74-11 130-4 190 21 50 21 104 24 210 6v29H0Z" fill="#FFB07D"/>
  <rect x="78" y="76" width="90" height="120" rx="18" fill="#FFFFFF" opacity="0.86"/>
  <rect x="232" y="76" width="90" height="120" rx="18" fill="#FFFFFF" opacity="0.86"/>
  <path d="M105 186c10-31 25-51 48-62 7 5 14 12 17 19-23 9-38 23-49 43Z" fill="#FF6B35"/>
  <path d="M112 171c7-9 16-13 29-14 6 5 11 10 14 16-16 2-29 7-43 19Z" fill="#2F7CF6"/>
  <circle cx="130" cy="111" r="18" fill="#FFB287"/>
  <path d="M114 106c3-10 26-16 33 0-4-2-9-4-17-4s-13 2-16 4Z" fill="#3A2A1E"/>
  <path d="M278 188c-19-27-29-50-26-70 8-5 17-8 26-8 0 23 8 43 24 65Z" fill="#FF6B35"/>
  <path d="M278 188c13-6 22-14 31-31 8 0 16 2 22 6-11 17-28 31-53 38Z" fill="#34C759"/>
  <circle cx="277" cy="98" r="17" fill="#FFB287"/>
  <path d="M263 95c3-10 24-15 29 0-4-2-8-4-15-4s-11 2-14 4Z" fill="#3A2A1E"/>
  <rect x="154" y="102" width="92" height="60" rx="14" fill="#FFFFFF"/>
  <rect x="166" y="114" width="68" height="36" rx="10" fill="#FFF1EC" stroke="#FF6B35" stroke-width="4"/>
  <circle cx="200" cy="132" r="10" fill="#FF6B35"/>
  <path d="M170 148l18-18 12 12 13-10 21 16" fill="none" stroke="#FFB07D" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)

const DEFAULT_TASK_COVER = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="220" viewBox="0 0 400 220">
  <defs>
    <linearGradient id="coverBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FF7A45"/>
      <stop offset="100%" stop-color="#FF4D6D"/>
    </linearGradient>
  </defs>
  <rect width="400" height="220" rx="0" fill="url(#coverBg)"/>
  <circle cx="320" cy="44" r="24" fill="#FFD86B" opacity="0.95"/>
  <path d="M0 170c53-17 103-10 151 8 27 10 63 15 115 12 53-3 92 4 134 25v25H0Z" fill="#AF3B2D" opacity="0.24"/>
  <path d="M0 188c58-13 107-7 156 13 31 12 68 16 118 12 48-3 91 2 126 15v17H0Z" fill="#5F221B" opacity="0.24"/>
  <g transform="translate(96 44)">
    <circle cx="44" cy="24" r="14" fill="#FFCCAA"/>
    <path d="M33 20c4-9 21-12 25 0-3-2-8-4-13-4s-9 1-12 4Z" fill="#51392A"/>
    <path d="M46 38c18 3 30 16 36 37l-20 5c-4-15-11-23-22-25Z" fill="#FFD25D"/>
    <path d="M48 40 68 66 90 52l8 13-35 21-26-34Z" fill="#2F7CF6"/>
    <path d="M39 41 30 68 50 84l-11 11-29-23 13-37Z" fill="#FFFFFF"/>
    <path d="M62 77 86 94l-10 12-23-14Z" fill="#2D2D2D"/>
    <path d="M17 94 38 105l-7 14-23-11Z" fill="#2D2D2D"/>
  </g>
  <g transform="translate(212 58)">
    <circle cx="42" cy="22" r="13" fill="#FFCCAA"/>
    <path d="M31 19c4-8 20-11 24 0-3-2-7-4-12-4s-9 1-12 4Z" fill="#51392A"/>
    <path d="M44 36c17 4 28 17 34 34l-19 5c-4-12-10-19-21-22Z" fill="#34C759"/>
    <path d="M45 38 22 62 10 52l-8 12 28 21 28-34Z" fill="#FFFFFF"/>
    <path d="M37 39 55 63 77 56l5 14-34 12-21-29Z" fill="#FFE3D6"/>
    <path d="M20 86 39 102l-10 12-18-15Z" fill="#2D2D2D"/>
    <path d="M63 82 88 90l-5 15-25-8Z" fill="#2D2D2D"/>
  </g>
</svg>
`)

const ILLUSTRATION_EMPTY_TASKS = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="220" viewBox="0 0 280 220">
  <rect width="280" height="220" rx="32" fill="#FFF7F2"/>
  <circle cx="220" cy="50" r="24" fill="#FFD86B"/>
  <path d="M0 164c41-12 81-6 120 13 29 15 63 18 160 0v43H0Z" fill="#FFD2B8"/>
  <path d="M0 182c47-8 85-2 126 17 31 14 69 17 154 5v16H0Z" fill="#FFB07D"/>
  <g transform="translate(40 56)">
    <circle cx="34" cy="24" r="14" fill="#FFCCAA"/>
    <path d="M24 20c4-8 18-11 22 0-3-2-7-3-11-3s-8 1-11 3Z" fill="#4A3224"/>
    <path d="M35 38c16 3 27 15 32 34l-18 4c-4-12-10-19-19-21Z" fill="#FF6B35"/>
    <path d="M36 40 55 62 77 50l8 12-34 19-25-31Z" fill="#2F7CF6"/>
    <path d="M28 40 18 68 39 84l-10 11L1 73l13-36Z" fill="#FFFFFF"/>
  </g>
  <g transform="translate(126 98)">
    <rect x="0" y="0" width="112" height="74" rx="18" fill="#FFFFFF"/>
    <rect x="18" y="18" width="54" height="12" rx="6" fill="#FFE0D0"/>
    <rect x="18" y="40" width="76" height="10" rx="5" fill="#FFF0E8"/>
    <rect x="18" y="58" width="58" height="10" rx="5" fill="#FFF0E8"/>
    <circle cx="92" cy="26" r="10" fill="#FF6B35"/>
    <path d="M88 26l3 3 6-6" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`)

const ILLUSTRATION_EMPTY_TEAM = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="280" height="220" viewBox="0 0 280 220">
  <rect width="280" height="220" rx="32" fill="#FFF7F2"/>
  <circle cx="64" cy="54" r="22" fill="#FFD86B"/>
  <path d="M0 170c48-10 85-4 132 20 36 18 74 22 148 2v28H0Z" fill="#FFD2B8"/>
  <g transform="translate(42 72)">
    <circle cx="28" cy="20" r="12" fill="#FFCCAA"/>
    <path d="M18 18c3-8 16-10 20 0-2-1-6-3-10-3s-7 1-10 3Z" fill="#4A3224"/>
    <path d="M29 33c13 3 22 12 27 27l-15 4c-3-10-8-15-16-18Z" fill="#FF6B35"/>
    <path d="M30 35 45 54 65 44l7 10-28 16-21-26Z" fill="#2F7CF6"/>
  </g>
  <g transform="translate(111 64)">
    <circle cx="30" cy="20" r="12" fill="#FFCCAA"/>
    <path d="M20 17c3-8 16-10 20 0-2-1-6-3-10-3s-7 1-10 3Z" fill="#4A3224"/>
    <path d="M31 33c15 4 24 14 28 30l-16 4c-3-11-9-18-18-20Z" fill="#34C759"/>
    <path d="M32 35 16 54l-14-9-7 10 24 16 23-27Z" fill="#FFFFFF"/>
  </g>
  <g transform="translate(176 74)">
    <circle cx="28" cy="18" r="11" fill="#FFCCAA"/>
    <path d="M19 16c3-7 15-9 18 0-2-1-5-2-9-2s-6 1-9 2Z" fill="#4A3224"/>
    <path d="M28 29c12 3 20 11 24 25l-14 4c-3-9-8-14-15-16Z" fill="#FFD25D"/>
    <path d="M29 31 46 50l12-7 6 9-20 13-21-24Z" fill="#FF8B7A"/>
  </g>
  <path d="M78 161c18-18 38-27 61-27 25 0 45 9 63 27" fill="none" stroke="#FF6B35" stroke-width="8" stroke-linecap="round"/>
</svg>
`)

const ILLUSTRATION_START_POINT = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <rect width="320" height="180" rx="28" fill="rgba(255,255,255,0.16)"/>
  <path d="M0 138c41-17 78-15 126 6 30 13 63 17 110 10 29-4 58 0 84 12v14H0Z" fill="rgba(255,255,255,0.18)"/>
  <path d="M0 150c53-8 95-2 140 18 31 13 73 16 118 8 23-4 43-2 62 4v10H0Z" fill="rgba(255,255,255,0.14)"/>
  <path d="M240 58c0 28-36 54-36 54s-36-26-36-54a36 36 0 1 1 72 0Z" fill="#FFFFFF"/>
  <circle cx="204" cy="58" r="14" fill="#FF6B35"/>
  <g transform="translate(54 52)">
    <circle cx="26" cy="17" r="11" fill="#FFCCAA"/>
    <path d="M17 15c3-7 14-9 18 0-2-1-5-2-9-2s-7 1-9 2Z" fill="#512E1F"/>
    <path d="M28 29c13 3 22 11 27 26l-15 4c-4-9-8-14-16-17Z" fill="#FFD25D"/>
    <path d="M29 31 47 49 68 39l6 10-29 17-23-28Z" fill="#2F7CF6"/>
    <path d="M21 31 13 55l18 13-9 10L-1 61l10-31Z" fill="#FFFFFF"/>
  </g>
</svg>
`)

const ILLUSTRATION_CHECKIN = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <rect width="320" height="180" rx="28" fill="#FFF7F2"/>
  <circle cx="72" cy="48" r="22" fill="#FFD86B"/>
  <path d="M0 142c47-13 92-8 138 13 37 18 90 24 182 6v19H0Z" fill="#FFD2B8"/>
  <path d="M0 156c52-8 102-1 143 20 34 17 92 21 177 10v14H0Z" fill="#FFB07D"/>
  <rect x="186" y="38" width="86" height="108" rx="18" fill="#FFFFFF"/>
  <rect x="197" y="52" width="64" height="76" rx="12" fill="#FFF2EA" stroke="#FF6B35" stroke-width="4"/>
  <circle cx="229" cy="139" r="5" fill="#FF6B35"/>
  <g transform="translate(58 56)">
    <circle cx="30" cy="18" r="12" fill="#FFCCAA"/>
    <path d="M20 16c3-8 15-10 19 0-2-1-6-2-10-2s-7 1-9 2Z" fill="#51392A"/>
    <path d="M31 31c14 4 24 14 29 31l-17 4c-3-11-9-17-18-20Z" fill="#FF6B35"/>
    <path d="M32 33 17 53 2 45l-6 10 24 16 23-31Z" fill="#FFFFFF"/>
    <path d="M33 33 51 57 73 50l5 12-30 11-20-28Z" fill="#34C759"/>
  </g>
  <path d="M126 118c0 18-22 34-22 34s-22-16-22-34a22 22 0 0 1 44 0Z" fill="#FF6B35"/>
  <circle cx="104" cy="118" r="8" fill="#FFFFFF"/>
</svg>
`)

const ILLUSTRATION_LOGIN = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <rect width="320" height="180" rx="28" fill="rgba(255,255,255,0.14)"/>
  <circle cx="244" cy="38" r="20" fill="#FFD86B"/>
  <path d="M0 144c49-12 92-6 139 14 37 16 92 18 181 1v21H0Z" fill="rgba(255,255,255,0.15)"/>
  <g transform="translate(36 56)">
    <circle cx="28" cy="18" r="12" fill="#FFCCAA"/>
    <path d="M19 16c3-8 15-9 18 0-2-1-5-2-9-2s-7 1-9 2Z" fill="#4A3224"/>
    <path d="M28 31c14 4 23 13 28 28l-16 4c-3-10-9-16-18-19Z" fill="#FFFFFF"/>
    <path d="M30 32 49 52 69 44l7 10-30 17-24-28Z" fill="#2F7CF6"/>
  </g>
  <g transform="translate(104 70)">
    <circle cx="30" cy="18" r="12" fill="#FFCCAA"/>
    <path d="M21 16c3-8 15-9 18 0-2-1-5-2-9-2s-7 1-9 2Z" fill="#4A3224"/>
    <path d="M31 31c14 4 24 13 29 28l-16 4c-3-10-9-16-18-19Z" fill="#FFD25D"/>
    <path d="M32 32 15 51 0 43l-7 10 25 17 24-28Z" fill="#FFFFFF"/>
  </g>
  <rect x="202" y="56" width="78" height="96" rx="18" fill="#FFFFFF"/>
  <rect x="213" y="68" width="56" height="68" rx="12" fill="#FFF2EA" stroke="#FF6B35" stroke-width="4"/>
  <circle cx="241" cy="144" r="4.5" fill="#FF6B35"/>
  <path d="M228 90h26M220 106h42" stroke="#FFB07D" stroke-width="5" stroke-linecap="round"/>
</svg>
`)

const ILLUSTRATION_MESSAGES = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <rect width="320" height="180" rx="28" fill="#FFF7F2"/>
  <circle cx="72" cy="42" r="18" fill="#FFD86B"/>
  <path d="M0 146c45-8 84-3 131 18 37 16 91 18 189 0v16H0Z" fill="#FFD2B8"/>
  <g transform="translate(40 74)">
    <path d="M0 18a18 18 0 0 1 18-18h74a18 18 0 0 1 18 18v31a18 18 0 0 1-18 18H42L14 90V67A18 18 0 0 1 0 49Z" fill="#FFFFFF"/>
    <path d="M26 25h58M26 40h43" stroke="#FFB07D" stroke-width="6" stroke-linecap="round"/>
  </g>
  <g transform="translate(176 42)">
    <circle cx="30" cy="18" r="12" fill="#FFCCAA"/>
    <path d="M21 16c3-8 15-10 18 0-2-1-5-2-9-2s-7 1-9 2Z" fill="#4A3224"/>
    <path d="M30 31c14 4 23 13 29 28l-16 4c-4-10-9-16-18-19Z" fill="#34C759"/>
    <path d="M32 33 51 53 72 45l6 10-30 17-24-29Z" fill="#FF8B7A"/>
  </g>
  <circle cx="246" cy="118" r="20" fill="#FF6B35"/>
  <path d="M236 118l6 6 12-13" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)

const ILLUSTRATION_RECORDS = svgToDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
  <rect width="320" height="180" rx="28" fill="#FFF7F2"/>
  <circle cx="250" cy="42" r="20" fill="#FFD86B"/>
  <path d="M0 148c47-10 90-2 139 18 36 15 91 18 181 2v12H0Z" fill="#FFD2B8"/>
  <g transform="translate(38 68)">
    <circle cx="30" cy="18" r="12" fill="#FFCCAA"/>
    <path d="M21 16c3-8 15-10 18 0-2-1-5-2-9-2s-7 1-9 2Z" fill="#4A3224"/>
    <path d="M31 31c14 4 24 13 29 29l-16 4c-3-10-9-16-18-19Z" fill="#FF6B35"/>
    <path d="M32 33 50 53 72 45l6 10-30 17-23-29Z" fill="#2F7CF6"/>
  </g>
  <path d="M184 38h44v22c0 15-10 29-25 33-14-4-24-18-24-33V38Z" fill="#FFFFFF" stroke="#FF6B35" stroke-width="4" stroke-linejoin="round"/>
  <path d="M186 43h-12c0 14 4 22 12 27M228 43h12c0 14-4 22-12 27" stroke="#FFD25D" stroke-width="4" stroke-linecap="round"/>
  <path d="M196 93h16M192 103h24" stroke="#FF6B35" stroke-width="5" stroke-linecap="round"/>
</svg>
`)

module.exports = {
  DEFAULT_AVATAR,
  DEFAULT_IMAGE,
  DEFAULT_TASK_COVER,
  ILLUSTRATION_EMPTY_TASKS,
  ILLUSTRATION_EMPTY_TEAM,
  ILLUSTRATION_START_POINT,
  ILLUSTRATION_CHECKIN,
  ILLUSTRATION_LOGIN,
  ILLUSTRATION_MESSAGES,
  ILLUSTRATION_RECORDS
}
