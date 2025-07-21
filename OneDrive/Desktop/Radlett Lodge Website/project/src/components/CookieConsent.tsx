import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import Button from './Button';

const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing consent to avoid layout shift
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowConsent(false);
    
    // Initialize analytics here if user accepts
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 shadow-lg animate-fadeIn">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start">
            <Cookie className="w-6 h-6 text-secondary-500 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-primary-600 mb-1">Cookie Consent</h3>
              <p className="text-sm text-neutral-600">
                We use cookies to enhance your browsing experience and analyze our traffic. 
                By clicking "Accept", you consent to our use of cookies.{' '}
                <a href="/privacy" className="text-secondary-500 hover:text-secondary-600 underline">
                  Learn more
                </a>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={declineCookies}>
              Decline
            </Button>
            <Button size="sm" onClick={acceptCookies}>
              Accept
            </Button>
            <button
              onClick={declineCookies}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;