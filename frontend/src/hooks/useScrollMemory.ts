import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// In-memory scroll position store per route
const scrollPositions: Record<string, number> = {};

export const useScrollMemory = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    // Restore saved scroll position or scroll to top smoothly
    const savedY = scrollPositions[currentPath];
    if (typeof savedY === 'number') {
      window.scrollTo({ top: savedY, behavior: 'instant' as ScrollBehavior });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }

    // Save scroll position when leaving current route
    return () => {
      scrollPositions[currentPath] = window.scrollY;
    };
  }, [location.pathname]);
};
