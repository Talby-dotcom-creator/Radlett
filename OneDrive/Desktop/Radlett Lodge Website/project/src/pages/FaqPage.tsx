import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import SectionHeading from '../components/SectionHeading';
import FaqItem from '../components/FaqItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { cmsApi } from '../lib/cmsApi';
import { CMSFAQItem } from '../types';
import { HelpCircle } from 'lucide-react';

const FaqPage: React.FC = () => {
  const [faqs, setFaqs] = useState<CMSFAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        setLoading(true);
        setError(null);
        const faqData = await cmsApi.getFAQItems();
        // Filter for published FAQs and sort by sort_order
        const publishedFAQs = faqData
          .filter(faq => faq.is_published)
          .sort((a, b) => a.sort_order - b.sort_order);
        setFaqs(publishedFAQs);
      } catch (err) {
        console.error('Error loading FAQs:', err);
        setError('Failed to load FAQ items. Please try again later.');
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    loadFAQs();
  }, []);

  // Convert CMS FAQ to component format
  const convertFAQData = (cmsFAQ: CMSFAQItem) => ({
    question: cmsFAQ.question,
    answer: cmsFAQ.answer
  });

  return (
    <>
      <HeroSection
        title="Frequently Asked Questions"
        subtitle="Answers to common questions about Freemasonry and Radlett Lodge"
        backgroundImage="https://images.pexels.com/photos/4728655/pexels-photo-4728655.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title="Common Questions" 
            subtitle="We've compiled answers to questions we frequently receive about Freemasonry and our Lodge."
            centered
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <div className="max-w-3xl mx-auto mt-12">
            {loading ? (
              <LoadingSpinner subtle={true} className="py-4" />
            ) : faqs.length > 0 ? (
              <div className="bg-neutral-50 rounded-lg p-6 md:p-8 shadow-soft">
                {faqs.map((faq) => (
                  <FaqItem key={faq.id} faq={convertFAQData(faq)} />
                ))}
              </div>
            ) : (
              <div className="bg-neutral-50 rounded-lg p-8 text-center">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p className="text-neutral-600">No FAQ items available at this time.</p>
                <p className="text-sm text-neutral-500 mt-2">Check back soon for answers to common questions!</p>
              </div>
            )}
            
            <div className="mt-12 text-center">
              <p className="mb-6 text-neutral-600">
                Still have questions? We're here to help.
              </p>
              <Link to="/contact">
                <Button>
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FaqPage;