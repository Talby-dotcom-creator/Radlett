import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { cmsApi } from '../lib/cmsApi';
import { CMSSiteSetting } from '../types';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website'
}) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSEOSettings = async () => {
      try {
        const siteSettings = await cmsApi.getSiteSettings();
        
        // Convert to a key-value map for easier access
        const settingsMap: Record<string, string> = {};
        siteSettings.forEach(setting => {
          settingsMap[setting.setting_key] = setting.setting_value;
        });
        
        setSettings(settingsMap);
      } catch (error) {
        console.error('Error loading SEO settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSEOSettings();
  }, []);

  // Use provided values or fall back to settings from CMS, then to defaults
  const lodgeName = settings.lodge_name || 'Radlett Lodge No. 6652';
  const finalTitle = title || lodgeName + ' - Freemasons';
  const finalDescription = description || settings.seo_description || 'Official website of Radlett Lodge No. 6652 - Freemasons. Learn about our history, activities, and how to join our Lodge in Hertfordshire.';
  const finalKeywords = keywords || settings.seo_keywords || 'Freemasonry, Radlett Lodge, Hertfordshire, United Grand Lodge of England, Masonic Lodge, Brotherhood, Charity';
  const finalImage = image || settings.seo_image_url || '/og-image.jpg';
  const finalUrl = url || settings.seo_site_url || 'https://radlettlodge6652.org.uk';
  
  // Create full title with lodge name
  const fullTitle = finalTitle.includes(lodgeName) ? finalTitle : `${finalTitle} | ${lodgeName}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Radlett Lodge No. 6652" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={lodgeName} />
      <link rel="canonical" href={url} />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": lodgeName,
          "description": finalDescription,
          "url": finalUrl,
          "logo": `${url}/favicon.svg`,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": settings.schema_address_street || "Radlett Masonic Centre, Rose Walk",
            "addressLocality": settings.schema_address_locality || "Radlett",
            "addressRegion": settings.schema_address_region || "Hertfordshire",
            "postalCode": settings.schema_address_postal_code || "WD7 7JS",
            "addressCountry": settings.schema_address_country || "GB"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": settings.schema_contact_telephone || "+44-7590-800657",
            "contactType": "customer service",
            "email": settings.schema_contact_email || "mattjohnson56@hotmail.co.uk"
          },
          "sameAs": [
            settings.schema_same_as_ugle || "https://www.ugle.org.uk/",
            settings.schema_same_as_pglherts || "https://www.pglherts.org/"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEOHead;