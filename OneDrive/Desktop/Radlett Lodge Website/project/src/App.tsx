import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import './index.css';

// Layout
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import JoinPage from './pages/JoinPage';
import EventsPage from './pages/EventsPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ContactPage from './pages/ContactPage';
import FaqPage from './pages/FaqPage';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import MembersPage from './pages/MembersPage';
import AdminPage from './pages/AdminPage';
import CMSAdminPage from './pages/CMSAdminPage';
import ProfilePage from './pages/ProfilePage';
import MembersPendingPage from './pages/MembersPendingPage';
import DirectoryPage from './pages/DirectoryPage';
import SetupAdminPage from './pages/SetupAdminPage';
import DebugPage from './pages/DebugPage';
import ViteDebugPage from './pages/ViteDebugPage';
import TermsPage from './pages/TermsPage';
import StorageDebugPage from './pages/StorageDebugPage';
import PasswordResetPage from './pages/PasswordResetPage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="join" element={<JoinPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="setup-admin" element={<SetupAdminPage />} />
          <Route path="password-reset" element={<PasswordResetPage />} />
          <Route path="debug" element={<DebugPage />} />
          <Route path="vite-debug" element={<ViteDebugPage />} />
          <Route path="storage-debug" element={<StorageDebugPage />} />
          <Route path="members/pending" element={<MembersPendingPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="members/admin" element={<AdminPage />} />
          <Route path="members/cms" element={<CMSAdminPage />} />
          <Route path="members/profile" element={<ProfilePage />} />
          <Route path="members/directory" element={<DirectoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;