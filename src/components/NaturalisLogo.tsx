import React from 'react';

interface NaturalisLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  variant?: 'badge' | 'compact' | 'full';
  priority?: boolean;
}

export const NaturalisLogo: React.FC<NaturalisLogoProps> = ({
  className = '',
  size,
  priority = false,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none shrink-0 ${className}`}
      style={style}
    >
      <img
        src="/logo.png"
        alt="Naturalis Gourmet"
        className="w-full h-full object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
};
