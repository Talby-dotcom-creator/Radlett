import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsApi } from '../lib/cmsApi';
import LoadingSpinner from '../components/LoadingSpinner';

const TermsPage: React.FC = () => {
  const [pageContent, setPageContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPageContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all page content for the terms page
        const content = await cmsApi.getPageContent('terms');
        
        // Convert to a key-value map for easier access
        const contentMap: Record<string, string> = {};
        content.forEach(item => {
          contentMap[item.section_name] = item.content;
        });
        
        setPageContent(contentMap);
      } catch (err) {
        console.error('Error loading terms page content:', err);
        setError('Failed to load page content');
        // We'll still render the default content
      } finally {
        setLoading(false);
      }
    };

    loadPageContent();
  }, []);

  // Get content from CMS or use defaults
  const introText = pageContent.intro || 'These Terms of Use govern your use of the Radlett Lodge No. 6652 website ("we," "our," or "us"). By accessing or using our website, you agree to be bound by these terms.';
  const acceptanceText = pageContent.acceptance || 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.';
  const useLicenseText = pageContent.use_license || 'Permission is granted to temporarily download one copy of the materials on Radlett Lodge No. 6652\'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n- modify or copy the materials\n- use the materials for any commercial purpose or for any public display (commercial or non-commercial)\n- attempt to decompile or reverse engineer any software contained on the website\n- remove any copyright or other proprietary notations from the materials';
  const disclaimerText = pageContent.disclaimer || 'The materials on Radlett Lodge No. 6652\'s website are provided on an \'as is\' basis. Radlett Lodge No. 6652 makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.';
  const limitationsText = pageContent.limitations || 'In no event shall Radlett Lodge No. 6652 or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the website, even if Radlett Lodge No. 6652 or an authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.';
  const accuracyText = pageContent.accuracy || 'The materials appearing on Radlett Lodge No. 6652\'s website could include technical, typographical, or photographic errors. Radlett Lodge No. 6652 does not warrant that any of the materials on its website are accurate, complete, or current. Radlett Lodge No. 6652 may make changes to the materials contained on its website at any time without notice. However, Radlett Lodge No. 6652 does not make any commitment to update the materials.';
  const linksText = pageContent.links || 'Radlett Lodge No. 6652 has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Radlett Lodge No. 6652 of the site. Use of any such linked website is at the user\'s own risk.';
  const modificationsText = pageContent.modifications || 'Radlett Lodge No. 6652 may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.';
  const governingLawText = pageContent.governing_law || 'These terms and conditions are governed by and construed in accordance with the laws of England and Wales and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.';
  const lastUpdatedText = pageContent.last_updated || 'January 2025';

  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-600 mb-8">Terms of Use</h1>
        
        {loading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="lg" />
          </div>
        )}
        
        {error && <p className="text-red-600 mb-6">{error}</p>}
        
        <div className="prose max-w-none text-neutral-600">
          <p>{introText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Acceptance of Terms</h2>
          <p>{acceptanceText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Use License</h2>
          {useLicenseText.split('\n').map((item, index) => {
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
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Disclaimer</h2>
          <p>{disclaimerText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Limitations</h2>
          <p>{limitationsText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Accuracy of Materials</h2>
          <p>{accuracyText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Links</h2>
          <p>{linksText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Modifications</h2>
          <p>{modificationsText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Governing Law</h2>
          <p>{governingLawText}</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Privacy Policy</h2>
          <p>Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website, to understand our practices.</p>
          
          <h2 className="text-2xl font-heading font-bold text-primary-600 mt-8 mb-4">Contact Information</h2>
          <p>If you have any questions about these Terms of Use, please <Link to="/contact" className="text-secondary-500 hover:text-secondary-600 transition-colors">contact us</Link>.</p>
          
          <p className="mt-8 text-sm">Last updated: {lastUpdatedText}</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;