import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Simple analytics hook - replace with your preferred analytics service
export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters);
    }
  };

  const trackUserAction = (action: string, category: string, label?: string) => {
    trackEvent('user_action', {
      event_category: category,
      event_label: label,
      action: action
    });
  };

  return {
    trackEvent,
    trackUserAction
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}