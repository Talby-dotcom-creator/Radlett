import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { cmsApi } from '../lib/cmsApi';
import { CMSSiteSetting } from '../types';

const Footer: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFooterSettings = async () => {
      try {
        const siteSettings = await cmsApi.getSiteSettings();
        
        // Convert to a key-value map for easier access
        const settingsMap: Record<string, string> = {};
        siteSettings.forEach(setting => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });
        
        setSettings(settingsMap);
      } catch (error) {
        console.error('Error loading footer settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFooterSettings();
  }, []);

  const currentYear = new Date().getFullYear();
  const lodgeName = settings.lodge_name || 'Radlett Lodge No. 6652';
  const lodgeNumber = settings.lodge_number || '6652';
  const contactEmail = settings.contact_email || 'mattjohnson56@hotmail.co.uk';
  const contactPhone = settings.contact_phone || '07590 800657';
  const lodgeAddress = settings.lodge_address || 'Radlett Masonic Centre, Rose Walk, Radlett, Hertfordshire WD7 7JS';
  const facebookUrl = settings.facebook_url || '#';
  const twitterUrl = settings.twitter_url || '#';
  const instagramUrl = settings.instagram_url || '#';
  
  return (
    <footer className="bg-primary-600 text-neutral-50 pt-12 pb-6">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Lodge Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/LODGE PIC copy copy.png"
                alt="Lodge Logo"
                className="w-20 h-20 object-contain"
                onError={(e) => {
                  console.log('Logo failed to load in footer, using fallback');
                  e.currentTarget.style.display = 'none';
                  // Show fallback icon
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-20 h-20 bg-secondary-500 rounded-full items-center justify-center hidden">
                <Building2 className="w-10 h-10 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold">{lodgeName}</h2>
              </div>
            </div>
            <p className="mb-4 text-neutral-100 text-sm">
              A Freemasons lodge under the United Grand Lodge of England
              Dedicated to fostering brotherhood, charity, and personal development.
            </p>
            <div className="flex space-x-4">
              <a 
                href={facebookUrl} 
                className="text-neutral-100 hover:text-secondary-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href={twitterUrl} 
                className="text-neutral-100 hover:text-secondary-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href={instagramUrl} 
                className="text-neutral-100 hover:text-secondary-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-secondary-500">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-secondary-500 transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-secondary-500 transition-colors">About Us</Link></li>
              <li><Link to="/join" className="hover:text-secondary-500 transition-colors">Join Us</Link></li>
              <li><Link to="/events" className="hover:text-secondary-500 transition-colors">Events</Link></li>
              <li><Link to="/news" className="hover:text-secondary-500 transition-colors">News</Link></li>
              <li><Link to="/contact" className="hover:text-secondary-500 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-secondary-500">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="hover:text-secondary-500 transition-colors">FAQs</Link></li>
              <li><a href="https://www.ugle.org.uk/" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-500 transition-colors">United Grand Lodge of England</a></li>
              <li><a href="https://www.pglherts.org/" target="_blank" rel="noopener noreferrer" className="hover:text-secondary-500 transition-colors">Provincial Grand Lodge of Hertfordshire</a></li>
              <li><Link to="/privacy" className="hover:text-secondary-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-secondary-500 transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
          
          {/* Contact Information */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-secondary-500">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 flex-shrink-0 mt-0.5 text-secondary-500" />
                <span>{lodgeAddress}</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-secondary-500" />
                <a href={`mailto:${contactEmail}`} className="hover:text-secondary-500 transition-colors">{contactEmail}</a>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-secondary-500" />
                <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="hover:text-secondary-500 transition-colors">{contactPhone}</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-500 pt-6 text-center text-sm text-neutral-100">
          <p>&copy; {currentYear} {lodgeName}. All rights reserved.</p>
          <p className="mt-2">Under the Constitution of the United Grand Lodge of England</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;