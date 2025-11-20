
import React from 'react';

interface IconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

export const StoreIcon: React.FC<IconProps> = ({ width = 20, height = 20, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
        <path d="M2 7h20"></path>
        <path d="M22 7H12v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"></path>
    </svg>
);