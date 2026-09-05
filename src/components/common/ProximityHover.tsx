import React from 'react';

interface ProximityHoverProps {
  children: React.ReactNode;
  className?: string;
  magnetic?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const ProximityHover: React.FC<ProximityHoverProps> = ({
  children,
  className = '',
  magnetic = false,
  onClick,
}) => {
  const baseClass = magnetic ? 'magnetic-btn proximity-card' : 'proximity-card';
  return (
    <div
      onClick={onClick}
      className={`${baseClass} ${className}`}
    >
      {children}
    </div>
  );
};
