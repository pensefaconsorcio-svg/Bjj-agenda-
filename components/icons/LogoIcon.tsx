import React from 'react';

interface LogoIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ width = 40, height = 40, className }) => (
  <svg width={width} height={height} viewBox="0 0 50 45" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <clipPath id="bjj-black-belt">
        <path d="M0 36 Q25 39 50 36 L50 44 Q25 41 0 44 Z" />
      </clipPath>
    </defs>
    
    {/* White Belt */}
    <path d="M0 0 Q25 3 50 0 L50 8 Q25 5 0 8 Z" fill="#FFFFFF"/>
    
    {/* Blue Belt */}
    <path d="M0 9 Q25 12 50 9 L50 17 Q25 14 0 17 Z" fill="#3B82F6"/>
    
    {/* Purple Belt */}
    <path d="M0 18 Q25 21 50 18 L50 26 Q25 23 0 26 Z" fill="#8B5CF6"/>
    
    {/* Brown Belt */}
    <path d="M0 27 Q25 30 50 27 L50 35 Q25 32 0 35 Z" fill="#A16207"/>
    
    {/* Black Belt with Stroke for visibility */}
    <path d="M0 36 Q25 39 50 36 L50 44 Q25 41 0 44 Z" stroke="#4B5563" strokeWidth="0.5"/>
    <g clipPath="url(#bjj-black-belt)">
      <rect x="0" y="36" width="42" height="8" fill="#1F2937" />
      <rect x="42" y="36" width="8" height="8" fill="#DC2626" />
    </g>
    
    {/* Knot */}
    <rect 
      x="18" y="16" width="14" height="14" rx="3" 
      fill="#1F2937" 
      stroke="#4B5563" 
      strokeWidth="1"
      transform="rotate(45 25 23)" 
    />
  </svg>
);