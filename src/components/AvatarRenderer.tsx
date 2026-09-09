import React from 'react';

export interface AvatarConfig {
  backgroundIndex: number;
  faceIndex: number;
  hairIndex: number;
  outfitIndex: number;
  eyesIndex: number;
  mouthIndex: number;
  nameColor: string;
}

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  backgroundIndex: 0,
  faceIndex: 0,
  hairIndex: 0,
  outfitIndex: 0,
  eyesIndex: 0,
  mouthIndex: 0,
  nameColor: '#ffffff',
};

export const BACKGROUND_COLORS = [
  '#facc15', // yellow (default like screenshot)
  '#eab308',
  '#f97316',
  '#ef4444',
  '#ec4899',
  '#d946ef',
  '#8b5cf6',
  '#6366f1',
  '#3b82f6',
  '#0ea5e9',
  '#06b6d4',
  '#14b8a6',
  '#10b981',
  '#22c55e',
  '#84cc16',
  '#a3e635',
  '#475569',
  '#334155',
  '#1e293b',
  '#0f172a',
  '#f43f5e',
  '#fb7185',
  '#38bdf8',
  '#c084fc',
];

export const SKIN_TONES = [
  '#fcd34d', // warm cartoon
  '#fed7aa', // peach
  '#fde047', // sunny
  '#fbcfe8', // soft pink
  '#fdba74', // tan
  '#d97706', // bronze
  '#b45309', // deep warm
  '#78350f', // rich dark
];

export const HAIR_COLORS = [
  '#ffffff', // white fluffy curly (screenshot)
  '#facc15', // blonde
  '#713f12', // brown
  '#1c1917', // black
  '#ea580c', // orange
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#8b5cf6', // purple
];

export const NAME_COLORS = [
  '#ec4899', '#f43f5e', '#fb7185', '#fda4af', '#e11d48', '#be123c', '#ea580c',
  '#f59e0b', '#eab308', '#facc15', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#38bdf8', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#d946ef', '#c084fc', '#e2e8f0'
];

export function getDefaultAvatarConfig(): AvatarConfig {
  return {
    backgroundIndex: 0,
    faceIndex: 1,
    hairIndex: 0, // fluffy white
    outfitIndex: 0,
    eyesIndex: 0,
    mouthIndex: 0,
    nameColor: '#ffffff',
  };
}

export function getRandomAvatarConfig(): AvatarConfig {
  return {
    backgroundIndex: Math.floor(Math.random() * BACKGROUND_COLORS.length),
    faceIndex: Math.floor(Math.random() * SKIN_TONES.length),
    hairIndex: Math.floor(Math.random() * 8),
    outfitIndex: Math.floor(Math.random() * 6),
    eyesIndex: Math.floor(Math.random() * 6),
    mouthIndex: Math.floor(Math.random() * 6),
    nameColor: NAME_COLORS[Math.floor(Math.random() * NAME_COLORS.length)],
  };
}

interface AvatarRendererProps {
  config?: AvatarConfig;
  imageUrl?: string;
  size?: number;
  className?: string;
}

export const AvatarRenderer: React.FC<AvatarRendererProps> = ({
  config,
  imageUrl,
  size = 64,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => {
    setImgFailed(false);
  }, [imageUrl]);

  if (imageUrl && !imgFailed) {
    return (
      <div
        className={`relative rounded-full overflow-hidden shrink-0 select-none shadow-md border border-white/20 bg-zinc-800 flex items-center justify-center ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        <img
          src={imageUrl}
          alt="Avatar"
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  const c = config || DEFAULT_AVATAR_CONFIG;
  const bgColor = BACKGROUND_COLORS[c.backgroundIndex % BACKGROUND_COLORS.length] || '#facc15';
  const skinColor = SKIN_TONES[c.faceIndex % SKIN_TONES.length] || '#fed7aa';
  const hairColor = HAIR_COLORS[c.hairIndex % HAIR_COLORS.length] || '#ffffff';
  config = c;

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 select-none shadow-sm ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body / Outfit */}
        {config.outfitIndex % 6 === 0 ? (
          // Chef / White Collared Shirt (like screenshot)
          <g>
            <path d="M25 80 Q50 68 75 80 L85 105 L15 105 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="2.5" />
            <path d="M42 78 L50 86 L58 78" stroke="#1c1917" strokeWidth="2" fill="none" />
            <circle cx="50" cy="92" r="2" fill="#1c1917" />
            <circle cx="50" cy="99" r="2" fill="#1c1917" />
          </g>
        ) : config.outfitIndex % 6 === 1 ? (
          // Hoodie
          <g>
            <path d="M22 80 Q50 65 78 80 L88 105 L12 105 Z" fill="#ec4899" stroke="#1c1917" strokeWidth="2.5" />
            <path d="M44 80 L44 95 M56 80 L56 95" stroke="#ffffff" strokeWidth="2" />
          </g>
        ) : config.outfitIndex % 6 === 2 ? (
          // Suit & Tie
          <g>
            <path d="M20 80 Q50 68 80 80 L90 105 L10 105 Z" fill="#1e293b" stroke="#1c1917" strokeWidth="2.5" />
            <polygon points="44,76 56,76 50,92" fill="#ffffff" />
            <polygon points="48,84 52,84 50,102" fill="#ef4444" />
          </g>
        ) : config.outfitIndex % 6 === 3 ? (
          // Astronaut Suit
          <g>
            <path d="M22 80 Q50 68 78 80 L88 105 L12 105 Z" fill="#f8fafc" stroke="#1c1917" strokeWidth="2.5" />
            <rect x="36" y="85" width="28" height="15" rx="3" fill="#0ea5e9" stroke="#1c1917" strokeWidth="1.5" />
          </g>
        ) : config.outfitIndex % 6 === 4 ? (
          // Graphic T-shirt
          <g>
            <path d="M24 80 Q50 70 76 80 L85 105 L15 105 Z" fill="#10b981" stroke="#1c1917" strokeWidth="2.5" />
            <circle cx="50" cy="92" r="5" fill="#facc15" />
          </g>
        ) : (
          // Casual Black Top
          <g>
            <path d="M24 80 Q50 68 76 80 L86 105 L14 105 Z" fill="#18181b" stroke="#1c1917" strokeWidth="2.5" />
          </g>
        )}

        {/* Neck */}
        <rect x="44" y="65" width="12" height="15" fill={skinColor} stroke="#1c1917" strokeWidth="2" rx="3" />

        {/* Head Base */}
        <ellipse cx="50" cy="48" rx="23" ry="24" fill={skinColor} stroke="#1c1917" strokeWidth="2.5" />

        {/* Hair - Behind & Front */}
        {config.hairIndex % 8 === 0 ? (
          // Curly White Cloud Hair (Exact match to screenshot!)
          <g>
            {/* Fluffy clouds all around the head */}
            <circle cx="28" cy="40" r="10" fill={hairColor} stroke="#1c1917" strokeWidth="2" />
            <circle cx="25" cy="28" r="11" fill={hairColor} stroke="#1c1917" strokeWidth="2" />
            <circle cx="36" cy="18" r="11" fill={hairColor} stroke="#1c1917" strokeWidth="2" />
            <circle cx="50" cy="15" r="12" fill={hairColor} stroke="#1c1917" strokeWidth="2" />
            <circle cx="64" cy="18" r="11" fill={hairColor} stroke="#1c1917" strokeWidth="2" />
            <circle cx="75" cy="28" r="11" fill={hairColor} stroke="#1c1917" strokeWidth="2" />
            <circle cx="72" cy="40" r="10" fill={hairColor} stroke="#1c1917" strokeWidth="2" />
            {/* Top bangs curly bumps */}
            <circle cx="38" cy="26" r="8" fill={hairColor} />
            <circle cx="50" cy="24" r="9" fill={hairColor} />
            <circle cx="62" cy="26" r="8" fill={hairColor} />
          </g>
        ) : config.hairIndex % 8 === 1 ? (
          // Short Side Part
          <path
            d="M26 40 Q26 20 50 18 Q74 20 74 40 C70 30 60 25 50 25 C40 25 32 30 26 40 Z"
            fill={hairColor}
            stroke="#1c1917"
            strokeWidth="2"
          />
        ) : config.hairIndex % 8 === 2 ? (
          // High Ponytail
          <g>
            <ellipse cx="50" cy="24" rx="22" ry="12" fill={hairColor} stroke="#1c1917" strokeWidth="2" />
            <circle cx="50" cy="12" r="9" fill={hairColor} stroke="#1c1917" strokeWidth="2" />
          </g>
        ) : config.hairIndex % 8 === 3 ? (
          // Spiky Anime
          <path
            d="M24 38 L22 25 L32 28 L36 16 L48 24 L56 14 L62 25 L72 20 L72 38 Z"
            fill={hairColor}
            stroke="#1c1917"
            strokeWidth="2"
          />
        ) : config.hairIndex % 8 === 4 ? (
          // Wavy Long
          <g>
            <path d="M23 45 C18 55 20 75 25 80" stroke={hairColor} strokeWidth="10" strokeLinecap="round" />
            <path d="M77 45 C82 55 80 75 75 80" stroke={hairColor} strokeWidth="10" strokeLinecap="round" />
            <ellipse cx="50" cy="24" rx="24" ry="12" fill={hairColor} stroke="#1c1917" strokeWidth="2" />
          </g>
        ) : config.hairIndex % 8 === 5 ? (
          // Afro Puff
          <circle cx="50" cy="28" r="25" fill={hairColor} stroke="#1c1917" strokeWidth="2.5" />
        ) : config.hairIndex % 8 === 6 ? (
          // Beanie
          <g>
            <path d="M26 36 Q50 12 74 36 Z" fill="#f43f5e" stroke="#1c1917" strokeWidth="2.5" />
            <rect x="25" y="34" width="50" height="7" rx="3" fill="#fb7185" stroke="#1c1917" strokeWidth="2" />
          </g>
        ) : (
          // Clean Cut
          <path d="M27 34 Q50 20 73 34" stroke={hairColor} strokeWidth="6" strokeLinecap="round" />
        )}

        {/* Eyes */}
        {config.eyesIndex % 6 === 0 ? (
          // Happy dots / small dark circles (as in screenshot)
          <g fill="#1c1917">
            <circle cx="41" cy="46" r="3.2" />
            <circle cx="59" cy="46" r="3.2" />
          </g>
        ) : config.eyesIndex % 6 === 1 ? (
          // Cheerful squint curves
          <g stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M37 46 Q41 42 45 46" />
            <path d="M55 46 Q59 42 63 46" />
          </g>
        ) : config.eyesIndex % 6 === 2 ? (
          // Cool Sunglasses
          <g fill="#1c1917">
            <rect x="34" y="42" width="13" height="9" rx="2" stroke="#1c1917" strokeWidth="1.5" />
            <rect x="53" y="42" width="13" height="9" rx="2" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="47" y1="46" x2="53" y2="46" stroke="#1c1917" strokeWidth="2" />
          </g>
        ) : config.eyesIndex % 6 === 3 ? (
          // Wink
          <g fill="#1c1917">
            <circle cx="41" cy="46" r="3.2" />
            <path d="M55 46 Q59 41 63 46" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        ) : config.eyesIndex % 6 === 4 ? (
          // Big Anime Eyes
          <g fill="#1c1917">
            <ellipse cx="41" cy="46" rx="4" ry="5.5" />
            <ellipse cx="59" cy="46" rx="4" ry="5.5" />
            <circle cx="42" cy="44" r="1.5" fill="#ffffff" />
            <circle cx="60" cy="44" r="1.5" fill="#ffffff" />
          </g>
        ) : (
          // Round Glasses
          <g stroke="#1c1917" strokeWidth="2" fill="none">
            <circle cx="41" cy="46" r="6" />
            <circle cx="59" cy="46" r="6" />
            <line x1="47" y1="46" x2="53" y2="46" />
            <circle cx="41" cy="46" r="2.5" fill="#1c1917" stroke="none" />
            <circle cx="59" cy="46" r="2.5" fill="#1c1917" stroke="none" />
          </g>
        )}

        {/* Blush / Cheeks */}
        <ellipse cx="33" cy="52" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4" />
        <ellipse cx="67" cy="52" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4" />

        {/* Mouth */}
        {config.mouthIndex % 6 === 0 ? (
          // Cute Open Smile (as in screenshot)
          <path d="M43 54 Q50 63 57 54 Z" fill="#1c1917" stroke="#1c1917" strokeWidth="1.5" />
        ) : config.mouthIndex % 6 === 1 ? (
          // Simple curved smile
          <path d="M44 55 Q50 61 56 55" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : config.mouthIndex % 6 === 2 ? (
          // Wide open grin with teeth
          <g>
            <path d="M42 53 Q50 64 58 53 Z" fill="#e11d48" stroke="#1c1917" strokeWidth="2" />
            <path d="M44 54 Q50 58 56 54 Z" fill="#ffffff" />
          </g>
        ) : config.mouthIndex % 6 === 3 ? (
          // Cute cat mouth :3
          <path d="M43 55 Q47 58 50 56 Q53 58 57 55" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : config.mouthIndex % 6 === 4 ? (
          // Playful Tongue Out
          <g>
            <path d="M43 54 Q50 61 57 54 Z" fill="#1c1917" />
            <path d="M47 57 Q50 64 53 57 Z" fill="#f43f5e" />
          </g>
        ) : (
          // Smirk
          <path d="M45 57 Q52 58 57 53" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </div>
  );
};
