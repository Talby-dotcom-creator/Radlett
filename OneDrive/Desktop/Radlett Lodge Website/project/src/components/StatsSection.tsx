import React, { useState, useEffect } from 'react';
import { Users, Calendar, Heart, Award } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { cmsApi } from '../lib/cmsApi';
import LoadingSpinner from './LoadingSpinner';

const StatsSection: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatsSettings = async () => {
      try {
        const siteSettings = await cmsApi.getSiteSettings();
        
        // Convert to a key-value map for easier access
        const settingsMap: Record<string, string> = {};
        siteSettings.forEach(setting => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });
        
        setSettings(settingsMap);
      } catch (error) {
        console.error('Error loading stats settings:', error);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStatsSettings();
  }, []);

  // Define stats with values from CMS or fallbacks
  const stats = [
    {
      icon: Users,
      value: parseInt(settings.active_members_count || '28'),
      suffix: '+',
      label: 'Active Members',
      description: 'Dedicated Freemasons'
    },
    {
      icon: Calendar,
      value: parseInt(settings.years_of_service || '76'),
      suffix: '',
      label: 'Years of Service',
      description: `Since ${settings.founded_year || '1948'}`
    },
    {
      icon: Heart,
      value: settings.charity_raised_annually?.replace(/[^0-9]/g, '') 
             ? parseInt(settings.charity_raised_annually.replace(/[^0-9]/g, '')) 
             : 52,
      suffix: settings.charity_raised_annually?.includes('M+') ? 'M+' : '',
      label: 'Charitable Donation',
      description: 'annually (UGLE)'
    },
    {
      icon: Award,
      value: parseInt(settings.regular_meetings_count || '5'),
      suffix: '',
      label: 'Regular Meetings',
      description: 'Members Only'
    }
  ];

  return (
    <section className="py-20 bg-primary-600 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Our Lodge by Numbers
          </h2>
          <p className="text-lg text-neutral-100 max-w-2xl mx-auto">
            A testament to our commitment to brotherhood, charity, and community service
          </p>
        </div>
        
        {loading ? (
          <LoadingSpinner subtle={true} className="text-white py-4" />
        ) : error ? (
          <div className="bg-primary-700 p-6 rounded-lg text-center">
            <p className="text-neutral-100">Statistics are currently unavailable</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary-500 rounded-full mb-4">
                  <stat.icon size={32} className="text-primary-800" />
                </div>
                <div className="text-3xl md:text-4xl font-heading font-bold mb-2">
                  <AnimatedCounter 
                    end={stat.value} 
                    suffix={stat.suffix}
                    className="text-secondary-500"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-1">{stat.label}</h3>
                <p className="text-sm text-neutral-100">{stat.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsSection;