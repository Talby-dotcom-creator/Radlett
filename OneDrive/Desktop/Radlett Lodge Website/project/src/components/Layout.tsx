import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MembersHeader from './MembersHeader';
import SkipLink from './SkipLink';
import CookieConsent from './CookieConsent';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

const Layout: React.FC = () => {
  const { toasts, removeToast } = useToast();
  const location = useLocation();
  
  // Check if we're in the members area
  const isMembersArea = location.pathname.startsWith('/members');

  return (
    <div className="flex flex-col min-h-screen">
      <SkipLink />
      {isMembersArea ? <MembersHeader /> : <Header />}
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
      
      {/* Global Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Layout;