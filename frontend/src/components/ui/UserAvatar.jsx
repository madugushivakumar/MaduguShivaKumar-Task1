import React from 'react';

// Illustrated Portrait SVGs matching the reference design avatars
export const ShivaAvatar = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#E2E8F0" />
    {/* Body / Shirt */}
    <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#1D4ED8" />
    <path d="M43 68 L50 78 L57 68 Z" fill="#FFFFFF" />
    {/* Neck */}
    <rect x="44" y="58" width="12" height="14" rx="3" fill="#D4A373" />
    {/* Head */}
    <ellipse cx="50" cy="46" rx="17" ry="20" fill="#D4A373" />
    {/* Hair */}
    <path d="M32 40 C32 26 40 22 50 22 C60 22 68 26 68 40 C68 33 63 26 50 26 C37 26 32 33 32 40 Z" fill="#1E293B" />
    <path d="M31 38 C32 30 40 24 50 24 C60 24 68 30 69 38 C67 33 62 28 50 28 C38 28 33 33 31 38 Z" fill="#0F172A" />
    {/* Beard & Mustache */}
    <path d="M40 54 C44 57 56 57 60 54 C60 62 55 65 50 65 C45 65 40 62 40 54 Z" fill="#1E293B" />
    <path d="M44 51 C47 53 53 53 56 51 C54 53 46 53 44 51 Z" fill="#0F172A" />
    {/* Eyes */}
    <ellipse cx="44" cy="44" rx="2" ry="1.5" fill="#0F172A" />
    <ellipse cx="56" cy="44" rx="2" ry="1.5" fill="#0F172A" />
    {/* Eyebrows */}
    <path d="M41 40 Q44 38 47 40" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M53 40 Q56 38 59 40" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const PriyaAvatar = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#FCE7F3" />
    {/* Long Hair Back */}
    <path d="M26 40 C26 68 28 85 36 95 L64 95 C72 85 74 68 74 40 C74 20 62 18 50 18 C38 18 26 20 26 40 Z" fill="#1E293B" />
    {/* Body / Blouse */}
    <path d="M24 100 C24 78 36 72 50 72 C64 72 76 78 76 100 Z" fill="#0284C7" />
    {/* Neck */}
    <rect x="45" y="60" width="10" height="15" rx="3" fill="#E0AC69" />
    {/* Head */}
    <ellipse cx="50" cy="48" rx="16" ry="18" fill="#E0AC69" />
    {/* Hair Front */}
    <path d="M30 42 C30 26 40 22 50 22 C60 22 70 26 70 42 C66 33 60 28 50 28 C40 28 34 33 30 42 Z" fill="#0F172A" />
    <path d="M30 42 C32 55 35 65 35 70 C33 60 32 50 30 42 Z" fill="#0F172A" />
    <path d="M70 42 C68 55 65 65 65 70 C67 60 68 50 70 42 Z" fill="#0F172A" />
    {/* Eyes */}
    <ellipse cx="44" cy="46" rx="2" ry="1.5" fill="#0F172A" />
    <ellipse cx="56" cy="46" rx="2" ry="1.5" fill="#0F172A" />
    {/* Smile */}
    <path d="M45 56 Q50 60 55 56" stroke="#B91C1C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
  </svg>
);

export const RahulAvatar = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#E0E7FF" />
    {/* Body */}
    <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#2563EB" />
    {/* Neck */}
    <rect x="44" y="58" width="12" height="14" rx="3" fill="#D4A373" />
    {/* Head */}
    <ellipse cx="50" cy="46" rx="17" ry="20" fill="#D4A373" />
    {/* Hair */}
    <path d="M32 38 C32 24 40 22 50 22 C60 22 68 24 68 38 C68 30 62 26 50 26 C38 26 32 30 32 38 Z" fill="#0F172A" />
    {/* Stubble / Beard */}
    <path d="M41 55 C44 59 56 59 59 55 C59 62 55 64 50 64 C45 64 41 62 41 55 Z" fill="#334155" opacity="0.6" />
    {/* Eyes */}
    <ellipse cx="44" cy="44" rx="2" ry="1.5" fill="#0F172A" />
    <ellipse cx="56" cy="44" rx="2" ry="1.5" fill="#0F172A" />
  </svg>
);

export const ArjunAvatar = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#FEF3C7" />
    {/* Body */}
    <path d="M22 100 C22 75 35 68 50 68 C65 68 78 75 78 100 Z" fill="#38BDF8" />
    {/* Neck */}
    <rect x="44" y="58" width="12" height="14" rx="3" fill="#C68642" />
    {/* Head */}
    <ellipse cx="50" cy="46" rx="17" ry="19" fill="#C68642" />
    {/* Hair */}
    <path d="M32 40 C32 25 42 22 50 22 C58 22 68 25 68 40 C66 32 60 27 50 27 C40 27 34 32 32 40 Z" fill="#1E293B" />
    {/* Smile */}
    <path d="M45 56 Q50 59 55 56" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    {/* Eyes */}
    <ellipse cx="44" cy="44" rx="2" ry="1.5" fill="#0F172A" />
    <ellipse cx="56" cy="44" rx="2" ry="1.5" fill="#0F172A" />
  </svg>
);

export const AnanyaAvatar = ({ className = 'w-full h-full' }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="50" fill="#FEF9C3" />
    {/* Hair Back */}
    <path d="M28 42 C28 65 30 82 38 90 L62 90 C70 82 72 65 72 42 C72 22 62 19 50 19 C38 19 28 22 28 42 Z" fill="#1E293B" />
    {/* Body / Yellow Top */}
    <path d="M24 100 C24 78 36 72 50 72 C64 72 76 78 76 100 Z" fill="#EAB308" />
    {/* Neck */}
    <rect x="45" y="60" width="10" height="15" rx="3" fill="#E0AC69" />
    {/* Head */}
    <ellipse cx="50" cy="48" rx="16" ry="18" fill="#E0AC69" />
    {/* Hair Front */}
    <path d="M32 40 C32 26 40 23 50 23 C60 23 68 26 68 40 C65 32 58 28 50 28 C42 28 35 32 32 40 Z" fill="#0F172A" />
    {/* Eyes */}
    <ellipse cx="44" cy="46" rx="2" ry="1.5" fill="#0F172A" />
    <ellipse cx="56" cy="46" rx="2" ry="1.5" fill="#0F172A" />
    {/* Smile */}
    <path d="M45 56 Q50 59 55 56" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

// Golden Crown SVG for Group Leader
export const GoldenCrown = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 18L5 7L9.5 13L12 4L14.5 13L19 7L21 18H3Z"
      fill="#F59E0B"
      stroke="#D97706"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="5" cy="7" r="1.5" fill="#FBBF24" />
    <circle cx="12" cy="4" r="1.5" fill="#FBBF24" />
    <circle cx="19" cy="7" r="1.5" fill="#FBBF24" />
    <circle cx="8" cy="18" r="1" fill="#FFFFFF" />
    <circle cx="12" cy="18" r="1" fill="#FFFFFF" />
    <circle cx="16" cy="18" r="1" fill="#FFFFFF" />
  </svg>
);

// Generic User Avatar resolver
export const UserAvatar = ({ name = '', size = 'md', className = '' }) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };
  const sizeClass = sizeMap[size] || sizeMap.md;

  const normalized = name.toLowerCase();
  let AvatarComponent = null;

  if (normalized.includes('shiva') || normalized.includes('alice')) {
    AvatarComponent = ShivaAvatar;
  } else if (normalized.includes('priya') || normalized.includes('diana') || normalized.includes('sarah')) {
    AvatarComponent = PriyaAvatar;
  } else if (normalized.includes('rahul') || normalized.includes('bob') || normalized.includes('alan')) {
    AvatarComponent = RahulAvatar;
  } else if (normalized.includes('arjun') || normalized.includes('charlie')) {
    AvatarComponent = ArjunAvatar;
  } else if (normalized.includes('ananya') || normalized.includes('fiona')) {
    AvatarComponent = AnanyaAvatar;
  }

  return (
    <div
      className={`${sizeClass} rounded-full overflow-hidden shadow-paper-sm ring-1 ring-[#D9D5CA] flex-shrink-0 flex items-center justify-center ${className}`}
    >
      {AvatarComponent ? (
        <AvatarComponent className="w-full h-full" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#1E293B] to-[#0F172A] text-white font-bold flex items-center justify-center text-xs">
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
