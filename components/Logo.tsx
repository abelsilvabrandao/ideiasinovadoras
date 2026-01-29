import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "text-white", size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 3h12" />
      <path d="M8 3v1a6 6 0 0 0 1.25 3.65l4.5 5.7c.4.5.75 1.15.75 1.85a4.5 4.5 0 0 1-9 0c0-.7.35-1.35.75-1.85l4.5-5.7A6 6 0 0 0 12 4V3" />
      <path d="M11 13h2" />
      <path d="M10 16h4" />
      <circle cx="12" cy="19" r="2" fill="currentColor" fillOpacity="0.3" />
      <path d="M15 6l2 2" />
      <path d="M17 4l2 2" />
    </svg>
  );
};