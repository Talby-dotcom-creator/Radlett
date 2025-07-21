import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsApi } from '../lib/cmsApi';
import LoadingSpinner from '../components/LoadingSpinner';

const PrivacyPage: React.FC = () => {
  const [pageContent, setPageContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPageContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all page content for the privacy page
        const content = await cmsApi.getPageContent('privacy');
        
        // Convert to a key-value map for easier access
        const contentMap: Record<string, string> = {};
        content.forEach(item => {
          contentMap[item.section_name] = item.content;
        });
        
        setPageContent(contentMap);
      } catch (err) {
        console.error('Error loading privacy page content:', err);
        setError('Failed to load page content');
        // We'll still render the default content
      } finally {
        setLoading(false);
      }
    };

    loadPageContent();
  }, []);

  // Get content from CMS or use defaults
  const introText = pageContent.intro || 'This Privacy Policy explains how Radlett Lodge No. 6652 ("we," "our," or "us") collects, uses, and protects your personal information when you visit our website or interact with us.';
  const infoCollectedText = pageContent.info_collected || 'We may collect the following personal information:\n- Name, email address, and contact information when you submit inquiries through our contact form\n- Information provided when expressing interest in joining our Lodge\n- Usage data and cookies to improve your browsing experience';
  const infoUsageText = pageContent.info_usage || 'We use your personal information to:\n- Respond to your inquiries and provide information about our Lodge\n- Process membership applications\n- Send communications about Lodge events and activities\n- Improve our website and services\n- Comply with legal obligations';
  const dataSecurityText = pageContent.data_security || 'We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no Internet-based site can be 100% secure, and we cannot guarantee the absolute security of your information.';
  const cookiesText = pageContent.cookies || 'Our website uses cookies to enhance your browsing experience. You can set your browser to refuse cookies or alert you when cookies are being sent. However, some parts of the site may not function properly if you disable cookies.';
  const thirdPartyText = pageContent.third_party || 'Our website may contain links to third-party websites. We have no control over the content or privacy practices of these sites and encourage you to review their privacy policies.';
  const yourRightsText = pageContent.your_rights || 'Depending on your location, you may have rights related to your personal information, including:\n- Access to your personal information\n- Correction of inaccurate data\n- Deletion of your personal information\n- Objection to processing\n- Data portability';
  const policyChangesText = pageContent.policy_changes || 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.';
  const lastUpdatedText = pageContent.last_updated || 'January 2025';

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-600 mb-8">Privacy Policy</h1>
        
        {loading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        {error && <p className="text-red-600 mb-6">{error}</p>}
        
        <div className="prose max-w-none text-neutral-600">
          <p>{introText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Information We Collect</h2>
          {infoCollectedText.split('\n').map((item, index) => {
            if (index === 0) return <p key={index}>{item}</p>;
            return <li key={index}>{item.replace(/^- /, '')}</li>;
          }).reduce((acc, item, index) => {
            if (index === 0) return [item];
            if (index === 1) return [...acc, <ul key="list" className="list-disc pl-6 mb-6">{item}</ul>];
            const lastIndex = acc.length - 1;
            const ul = acc[lastIndex];
            const newUl = React.cloneElement(ul, {}, [...ul.props.children, item]);
            return [...acc.slice(0, lastIndex), newUl];
          }, [] as React.ReactElement[])}
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">How We Use Your Information</h2>
          {infoUsageText.split('\n').map((item, index) => {
            if (index === 0) return <p key={index}>{item}</p>;
            return <li key={index}>{item.replace(/^- /, '')}</li>;
          }).reduce((acc, item, index) => {
            if (index === 0) return [item];
            if (index === 1) return [...acc, <ul key="list" className="list-disc pl-6 mb-6">{item}</ul>];
            const lastIndex = acc.length - 1;
            const ul = acc[lastIndex];
            const newUl = React.cloneElement(ul, {}, [...ul.props.children, item]);
            return [...acc.slice(0, lastIndex), newUl];
          }, [] as React.ReactElement[])}
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Data Security</h2>
          <p>{dataSecurityText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Cookies</h2>
          <p>{cookiesText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Third-Party Links</h2>
          <p>{thirdPartyText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Your Rights</h2>
          {yourRightsText.split('\n').map((item, index) => {
            if (index === 0) return <p key={index}>{item}</p>;
            return <li key={index}>{item.replace(/^- /, '')}</li>;
          }).reduce((acc, item, index) => {
            if (index === 0) return [item];
            if (index === 1) return [...acc, <ul key="list" className="list-disc pl-6 mb-6">{item}</ul>];
            const lastIndex = acc.length - 1;
            const ul = acc[lastIndex];
            const newUl = React.cloneElement(ul, {}, [...ul.props.children, item]);
            return [...acc.slice(0, lastIndex), newUl];
          }, [] as React.ReactElement[])}
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Changes to This Policy</h2>
          <p>{policyChangesText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please <Link to="/contact" className="text-secondary-500 hover:text-secondary-600 transition-colors">contact us</Link>.</p>
          
          <p className="mt-8 text-sm">Last updated: {lastUpdatedText}</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;