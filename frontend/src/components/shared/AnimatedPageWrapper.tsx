import React from 'react';
import { useScrollMemory } from '../../hooks/useScrollMemory';

interface AnimatedPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPageWrapper: React.FC<AnimatedPageWrapperProps> = ({ children, className = '' }) => {
  // Automatically manage and restore scroll position
  useScrollMemory();

  return (
    <div className={`gpu-layer animate-in fade-in-95 slide-in-from-bottom-2 duration-180 ease-in-out ${className}`}>
      {children}
    </div>
  );
};
