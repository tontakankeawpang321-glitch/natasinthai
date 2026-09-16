import React from 'react';

interface ThaiDancerIconProps {
  className?: string;
  size?: number;
}

export const ThaiDancerIcon: React.FC<ThaiDancerIconProps> = ({ 
  className = "w-6 h-6", 
  size 
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      aria-label="ตราสัญลักษณ์คนฟ้อนรำนาฏศิลป์ไทย"
    >
      <defs>
        <linearGradient id="dancerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="goldAura" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      {/* Chada (Thai Crown / Headdress with spire) */}
      <path
        d="M32 4L34.5 12L31 11L33 16L29 17L32 21L27 23L32 25L37 23L32 21L35 17L31 16L33 11L29.5 12L32 4Z"
        fill="url(#dancerGrad)"
      />
      {/* Crown Spire Peak Sparkle */}
      <circle cx="32" cy="4" r="1.5" fill="#fef3c7" />

      {/* Head / Face Profile */}
      <circle cx="32" cy="27" r="4.5" fill="url(#dancerGrad)" />
      {/* Ear ornament (Karn Jiek) */}
      <path d="M26.5 25.5C25.5 24 25.5 27 27 28Z" fill="#f59e0b" />
      <path d="M37.5 25.5C38.5 24 38.5 27 37 28Z" fill="#f59e0b" />

      {/* Neck & Shoulder necklace (Krong Kor) */}
      <path
        d="M28 31.5C30 33.5 34 33.5 36 31.5L38 34C35 37 29 37 26 34L28 31.5Z"
        fill="url(#goldAura)"
      />

      {/* Torso & Bodice (Suea Yuen Kruang) */}
      <path
        d="M28 34L27 44C30 46 34 46 37 44L36 34C34 35.5 30 35.5 28 34Z"
        fill="url(#dancerGrad)"
      />

      {/* Left Arm: Elegant Tang Wong (Upward Curved Arm with graceful fingers) */}
      <path
        d="M26 34.5C21 34 16 28 15 22C14.5 19 16 17 18 19C19 20 18.5 23 20 25C21.5 27 24 29 27 30L26 34.5Z"
        fill="url(#dancerGrad)"
      />
      {/* Graceful Finger Curve Left */}
      <path
        d="M17 18C15 16.5 13 18 14.5 20.5C15.5 22 17.5 20 17 18Z"
        fill="url(#goldAura)"
      />

      {/* Right Arm: Graceful Jeeb or Lower Tang Wong */}
      <path
        d="M38 34.5C43 35 48 39 49 45C49.5 48 48 50 46 48C45 47 45.5 44 44 42C42.5 40 40 38 37 37L38 34.5Z"
        fill="url(#dancerGrad)"
      />
      {/* Right Hand Jeeb Fingers */}
      <circle cx="48" cy="47" r="2" fill="url(#goldAura)" />

      {/* Lower Garment (Chong Kraben / Pha Thung with Na-Nang front pleat) */}
      <path
        d="M27 44L24 57C28 60 36 60 40 57L37 44C34 46 30 46 27 44Z"
        fill="url(#dancerGrad)"
      />
      {/* Center Pleat (Chai Wai / Na Nang) */}
      <path
        d="M30.5 45L31 59H33L33.5 45H30.5Z"
        fill="url(#goldAura)"
      />

      {/* Graceful Feet Position (Pra Thao / Yok Thao in classical stance) */}
      <path
        d="M25 57C23 58 20 59 19 61C22 62 26 60 27 58L25 57Z"
        fill="url(#dancerGrad)"
      />
      <path
        d="M39 57C41 58 44 59 45 61C42 62 38 60 37 58L39 57Z"
        fill="url(#dancerGrad)"
      />
    </svg>
  );
};
