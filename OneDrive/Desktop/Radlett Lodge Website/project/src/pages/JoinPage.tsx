import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import FaqItem from '../components/FaqItem';
import LoadingSpinner from '../components/LoadingSpinner';
import { cmsApi } from '../lib/cmsApi';
import { CMSFAQItem } from '../types';
import { HelpCircle } from 'lucide-react';

const JoinPage: React.FC = () => {
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
        title="Join Radlett Lodge No. 6652"
        subtitle="Begin your journey into Freemasonry with our welcoming Lodge community"
        backgroundImage="https://images.pexels.com/photos/6146929/pexels-photo-6146929.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading 
                title="Becoming a Freemason" 
                subtitle="Freemasonry welcomes men of good character who believe in a Supreme Being and want to contribute to their communities."
              />
              <p className="mb-6 text-neutral-600">
                Joining Radlett Lodge is the beginning of a lifelong journey of personal development, fellowship, and service. Our members come from all walks of life, backgrounds, and beliefs, united by shared values and a desire to make a positive impact on the world.
              </p>
              <p className="text-neutral-600">
                The process of becoming a Freemason is thoughtful and deliberate. We take time to get to know potential members, and for them to get to know us, ensuring that Freemasonry is the right path for each individual.
              </p>
            </div>
            <img
              src="https://images.pexels.com/photos/8837750/pexels-photo-8837750.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
              alt="Masonic Symbols"
              className="rounded-lg shadow-medium w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title="Membership Requirements" 
            subtitle="To be eligible for membership in Radlett Lodge No. 6652, you must meet the following criteria:"
            centered
          />
          
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-white rounded-lg shadow-medium p-6 md:p-8">
             <p className="text-neutral-600 mb-6 max-w-xl mx-auto text-center">To be eligible for membership in Radlett Lodge, you must meet the following criteria:</p>
              <ul className="space-y-4">
                <RequirementItem text="Be a man of at least 21 years of age" />
                <RequirementItem text="Believe in a Supreme Being (all faiths are welcome)" />
                <RequirementItem text="Be of good character and reputation" />
                <RequirementItem text="Have a sincere desire to improve yourself and contribute to your community" />
                <RequirementItem text="Be able to afford the financial commitments without detriment to your family or livelihood" />
                <RequirementItem text="Be free of criminal convictions (minor offenses may be considered on a case-by-case basis)" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title="The Path to Membership" 
            subtitle="The journey to becoming a member of Radlett Lodge involves several steps:"
            centered
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-neutral-50 rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center text-neutral-900 font-bold">1</div>
              <h3 className="text-xl font-heading font-semibold text-primary-600 mt-2 mb-3">Initial Contact</h3>
              <p className="text-neutral-600">
                Express your interest through our website or by contacting a current member. We'll arrange an informal meeting to discuss your interest in Freemasonry.
              </p>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center text-neutral-900 font-bold">2</div>
              <h3 className="text-xl font-heading font-semibold text-primary-600 mt-2 mb-3">Lodge Visit</h3>
              <p className="text-neutral-600">
                Attend a social function to meet Lodge members and get a feel for our community. This gives both you and us a chance to determine if there's a good fit.
              </p>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center text-neutral-900 font-bold">3</div>
              <h3 className="text-xl font-heading font-semibold text-primary-600 mt-2 mb-3">Application</h3>
              <p className="text-neutral-600">
                Complete an application form, which requires the endorsement of two current members who will serve as your proposer and seconder.
              </p>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center text-neutral-900 font-bold">4</div>
              <h3 className="text-xl font-heading font-semibold text-primary-600 mt-2 mb-3">Interview</h3>
              <p className="text-neutral-600">
                Meet with a committee of Lodge members who will discuss your interest in Freemasonry and answer any questions you may have.
              </p>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center text-neutral-900 font-bold">5</div>
              <h3 className="text-xl font-heading font-semibold text-primary-600 mt-2 mb-3">Lodge Ballot</h3>
              <p className="text-neutral-600">
                Your application will be presented to the Lodge members for approval. A unanimous favorable ballot is required for admission.
              </p>
            </div>
            
            <div className="bg-neutral-50 rounded-lg p-6 relative">
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-secondary-500 rounded-full flex items-center justify-center text-neutral-900 font-bold">6</div>
              <h3 className="text-xl font-heading font-semibold text-primary-600 mt-2 mb-3">Initiation</h3>
              <p className="text-neutral-600">
                Upon approval, you'll be initiated into the Lodge in a traditional ceremony that marks the beginning of your Masonic journey.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/contact">
              <Button variant="primary" size="lg">
                Inquire About Membership
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Financial Commitments */}
      <section className="py-20 bg-primary-50">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title="Financial Commitments" 
            subtitle="Transparency about the financial aspects of membership is important to us."
            centered
          />
          
          <div className="max-w-3xl mx-auto mt-12">
            <div className="bg-white rounded-lg shadow-medium p-6 md:p-8">
              <p className="mb-6 text-neutral-600">
                Membership in Radlett Lodge, as with all Masonic Lodges, involves certain financial obligations. These typically include:
              </p>
              <ul className="space-y-4 mb-6">
                <li className="flex items-start">
                  <span className="text-secondary-500 mr-3 mt-1 flex-shrink-0"><Check size={18} /></span>
                  <div>
                    <span className="font-medium text-primary-600">One-time Initiation Fee:</span>
                    <p className="text-neutral-600">This covers the costs associated with your initiation ceremony and registration with the United Grand Lodge of England.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-500 mr-3 mt-1 flex-shrink-0"><Check size={18} /></span>
                  <div>
                    <span className="font-medium text-primary-600">Annual Subscription:</span>
                    <p className="text-neutral-600">Yearly dues that support the operation of the Lodge and Provincial/Grand Lodge assessments.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-500 mr-3 mt-1 flex-shrink-0"><Check size={18} /></span>
                  <div>
                    <span className="font-medium text-primary-600">Dining Fees:</span>
                    <p className="text-neutral-600">The cost of meals when dining with fellow members after Lodge meetings (known as the Festive Board).</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="text-secondary-500 mr-3 mt-1 flex-shrink-0"><Check size={18} /></span>
                  <div>
                    <span className="font-medium text-primary-600">Charitable Donations:</span>
                    <p className="text-neutral-600">Voluntary contributions to Masonic and non-Masonic charities supported by the Lodge.</p>
                  </div>
                </li>
              </ul>
              <p className="text-neutral-600">
                Specific fee amounts will be discussed during your interview process. We believe that Freemasonry should be accessible to men of good character regardless of financial status, and we are committed to ensuring that dues are reasonable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title="Frequently Asked Questions" 
            subtitle="Answers to common questions about Freemasonry and joining Radlett Lodge"
            centered
          />
          
          <div className="max-w-3xl mx-auto mt-12">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {loading ? (
              <LoadingSpinner subtle={true} className="py-4" />
            ) : faqs.length > 0 ? (
              <div className="bg-neutral-50 rounded-lg p-6 md:p-8">
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
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Ready to Begin Your Masonic Journey?
          </h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto text-neutral-100">
            If you're interested in joining Radlett Lodge No. 6652 or have additional questions, we'd love to hear from you. Our Secretary will be happy to provide more information and guide you through the first steps.
          </p>
          <Link to="/contact">
            <Button variant="primary" size="lg">
              Contact Us Today
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
};

// Helper component for requirements list
const RequirementItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-center">
    <span className="text-secondary-500 mr-3 flex-shrink-0"><Check size={18} /></span>
    <span className="text-neutral-600">{text}</span>
  </li>
);

export default JoinPage;