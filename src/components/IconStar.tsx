import React from 'react';

interface IconStarProps {
  size?: number;
  fill?: string;
  stroke?: string; 
  strokeWidth?: number;
}

export default function IconStar({
  size = 16,
  fill = 'none',
  stroke = '#F29400',
  strokeWidth = 1,
}: IconStarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }} // Verhindert Schrumpfen des Icons
    >
      <polygon points="12 2 15 8.5 22 9.3 17 14 18.2 21 12 17.8 5.8 21 7 14 2 9.3 9 8.5 12 2" />
    </svg>
  );
}
