import React from 'react';
import { PartyPopper } from 'lucide-react';
import { UserProfile } from '../../types/eventreach';

export const BrandMark: React.FC<{ size?: 'sm' | 'md' | 'lg'; inverted?: boolean }> = ({
  size = 'md',
  inverted = false,
}) => {
  const textSize =
    size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 24 : 20;

  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 select-none ${
        inverted ? 'text-white' : 'text-[#AE5D72]'
      }`}
    >
      <PartyPopper
        size={iconSize}
        strokeWidth={2}
        className={inverted ? 'text-white' : 'text-[#B56576]'}
        aria-hidden="true"
      />
      <span className={`${textSize} font-semibold tracking-tight leading-none`}>
        Event
        <span className="font-serif-accent italic font-bold text-[1.12em] mx-[0.5px]">
          R
        </span>
        each
      </span>
    </span>
  );
};

export const UserAvatarDisplay: React.FC<{
  profile: UserProfile;
  size?: 'sm' | 'md' | 'lg';
}> = ({ profile, size = 'md' }) => {
  const dim =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'lg'
      ? 'w-20 h-20 text-2xl'
      : 'w-10 h-10 text-sm';

  if (profile.customAvatarDataUrl) {
    return (
      <img
        src={profile.customAvatarDataUrl}
        alt={profile.name}
        referrerPolicy="no-referrer"
        className={`${dim} rounded-full object-cover border border-[#E7C6CE] shrink-0`}
      />
    );
  }

  const presetStyles: Record<UserProfile['avatarPreset'], { bg: string; fg: string; ring: string }> = {
    rose: { bg: 'bg-[#F5CED7]', fg: 'text-[#6E2E42]', ring: 'border-[#DFAAB7]' },
    blush: { bg: 'bg-[#FCE8EC]', fg: 'text-[#8F4458]', ring: 'border-[#EBC3CD]' },
    mauve: { bg: 'bg-[#AE5D72]', fg: 'text-white', ring: 'border-[#8F4458]' },
    berry: { bg: 'bg-[#5B2E3D]', fg: 'text-[#FCE8EC]', ring: 'border-[#3D1D28]' },
  };

  const style = presetStyles[profile.avatarPreset] || presetStyles.rose;
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  return (
    <div
      className={`${dim} ${style.bg} ${style.fg} border ${style.ring} rounded-full flex items-center justify-center font-semibold shrink-0 select-none`}
      aria-label={profile.name}
    >
      {initials || 'ER'}
    </div>
  );
};
