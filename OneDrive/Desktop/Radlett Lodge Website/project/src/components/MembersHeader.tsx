import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, Home, FileText, Users, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const MembersHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-primary-600 text-white py-4 shadow-md">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link to="/members" className="flex items-center">
              <img
                src="/LODGE PIC copy copy.png"
                alt="Radlett Lodge Logo"
                className="w-10 h-10 mr-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 bg-secondary-500 rounded-full items-center justify-center hidden mr-3">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-lg font-heading font-bold">Members Area</h1>
                <p className="text-xs text-neutral-200">Radlett Lodge No. 6652</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/members" 
              className={`text-sm font-medium hover:text-secondary-300 transition-colors ${
                location.pathname === '/members' ? 'text-secondary-500' : 'text-neutral-50'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/members/profile" 
              className={`text-sm font-medium hover:text-secondary-300 transition-colors ${
                location.pathname === '/members/profile' ? 'text-secondary-500' : 'text-neutral-50'
              }`}
            >
              My Profile
            </Link>
            <Link 
              to="/members/directory" 
              className={`text-sm font-medium hover:text-secondary-300 transition-colors ${
                location.pathname === '/members/directory' ? 'text-secondary-500' : 'text-neutral-50'
              }`}
            >
              Directory
            </Link>
            {profile?.role === 'admin' && (
              <>
                <Link 
                  to="/members/admin" 
                  className={`text-sm font-medium hover:text-secondary-300 transition-colors ${
                    location.pathname === '/members/admin' ? 'text-secondary-500' : 'text-neutral-50'
                  }`}
                >
                  Admin
                </Link>
                <Link 
                  to="/members/cms" 
                  className={`text-sm font-medium hover:text-secondary-300 transition-colors ${
                    location.pathname === '/members/cms' ? 'text-secondary-500' : 'text-neutral-50'
                  }`}
                >
                  CMS
                </Link>
              </>
            )}
            <Link 
              to="/" 
              className="text-sm font-medium hover:text-secondary-300 transition-colors"
            >
              Main Site
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="ml-2 text-white border-white hover:bg-white hover:text-primary-600"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-primary-500 animate-fadeIn">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/members" 
                className={`flex items-center py-2 px-4 rounded-md ${
                  location.pathname === '/members' 
                    ? 'bg-primary-700 text-secondary-500' 
                    : 'text-white hover:bg-primary-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} className="mr-3" />
                Dashboard
              </Link>
              <Link 
                to="/members/profile" 
                className={`flex items-center py-2 px-4 rounded-md ${
                  location.pathname === '/members/profile' 
                    ? 'bg-primary-700 text-secondary-500' 
                    : 'text-white hover:bg-primary-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={18} className="mr-3" />
                My Profile
              </Link>
              <Link 
                to="/members/directory" 
                className={`flex items-center py-2 px-4 rounded-md ${
                  location.pathname === '/members/directory' 
                    ? 'bg-primary-700 text-secondary-500' 
                    : 'text-white hover:bg-primary-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Users size={18} className="mr-3" />
                Directory
              </Link>
              {profile?.role === 'admin' && (
                <>
                  <Link 
                    to="/members/admin" 
                    className={`flex items-center py-2 px-4 rounded-md ${
                      location.pathname === '/members/admin' 
                        ? 'bg-primary-700 text-secondary-500' 
                        : 'text-white hover:bg-primary-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText size={18} className="mr-3" />
                    Admin
                  </Link>
                  <Link 
                    to="/members/cms" 
                    className={`flex items-center py-2 px-4 rounded-md ${
                      location.pathname === '/members/cms' 
                        ? 'bg-primary-700 text-secondary-500' 
                        : 'text-white hover:bg-primary-700'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings size={18} className="mr-3" />
                    CMS
                  </Link>
                </>
              )}
              <Link 
                to="/" 
                className="flex items-center py-2 px-4 rounded-md text-white hover:bg-primary-700"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} className="mr-3" />
                Main Site
              </Link>
              <button
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
                className="flex items-center py-2 px-4 rounded-md text-white hover:bg-primary-700"
              >
                <LogOut size={18} className="mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default MembersHeader;