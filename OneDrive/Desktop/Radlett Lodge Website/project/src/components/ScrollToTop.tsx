import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // "document.documentElement.scrollTo" is the modern replacement for "window.scrollTo"
    // It ensures scrolling to the very top of the document.
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Use 'instant' for immediate jump, or 'smooth' for animation
    });
  }, [pathname]); // Dependency array: re-run effect whenever the pathname changes

  return null; // This component does not render any UI
};

export default ScrollToTop;