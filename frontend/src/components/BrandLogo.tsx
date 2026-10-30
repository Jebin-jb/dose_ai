import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const dimensions = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[10px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-xs' },
    lg: { icon: 54, text: 'text-2xl', sub: 'text-sm' }
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Abstract Capsule + Checkmark + Continuous Pathway Icon */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="DoseSaathi Logo"
      >
        {/* Soft rounded container */}
        <rect width="64" height="64" rx="16" fill="#123F3A" />
        
        {/* Capsule Base Contour */}
        <rect
          x="14"
          y="18"
          width="36"
          height="18"
          rx="9"
          stroke="#E6F4EF"
          strokeWidth="3.5"
          fill="none"
        />

        {/* Continuous Pathway flowing across and up */}
        <path
          d="M 16 32 C 16 46, 26 48, 34 48 C 44 48, 50 42, 50 32"
          stroke="#138A7B"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Precise Integrated Checkmark (Confirmation & Safe Ingestion Pathway) */}
        <path
          d="M 23 27 L 30 34 L 44 19"
          stroke="#138A7B"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Small warm amber pathway point (Thoughtful Indian touch) */}
        <circle cx="34" cy="48" r="3.2" fill="#D99026" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-bold tracking-tight text-[#123F3A] ${dimensions.text}`}>
            DoseSaathi <span className="text-[#138A7B] font-semibold">AI</span>
          </span>
          <span className={`text-[#66736F] font-normal tracking-normal ${dimensions.sub}`}>
            Careful Prescription Guide
          </span>
        </div>
      )}
    </div>
  );
};

