import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Heart, BookOpen, Building2 } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import SEOHead from '../components/SEOHead';
import Button from '../components/Button';
import EventCard from '../components/EventCard';
import NewsCard from '../components/NewsCard';
import TestimonialCard from '../components/TestimonialCard';
import StatsSection from '../components/StatsSection';
import CountdownTimer from '../components/CountdownTimer';
import LoadingSpinner from '../components/LoadingSpinner';
import { cmsApi } from '../lib/cmsApi';
import { CMSEvent, CMSNewsArticle, CMSTestimonial } from '../types';

const HomePage: React.FC = () => {
  const [events, setEvents] = useState<CMSEvent[]>([]);
  const [news, setNews] = useState<CMSNewsArticle[]>([]);
  const [testimonials, setTestimonials] = useState<CMSTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHomePageData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all data in parallel
        const [eventsData, newsData, testimonialsData] = await Promise.all([
          cmsApi.getEvents(),
          cmsApi.getNewsArticles(),
          cmsApi.getTestimonials()
        ]);

        // Filter for upcoming events only
        const now = new Date();
        const upcomingEvents = eventsData
          .filter(event => new Date(event.event_date) > now && !event.is_past_event)
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .slice(0, 3);

        // Filter for published news only
        const publishedNews = newsData
          .filter(article => article.is_published)
          .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime())
          .slice(0, 3);

        // Filter for published testimonials only
        const publishedTestimonials = testimonialsData
          .filter(testimonial => testimonial.is_published)
          .sort((a, b) => a.sort_order - b.sort_order);

        setEvents(upcomingEvents);
        setNews(publishedNews);
        setTestimonials(publishedTestimonials);

      } catch (err) {
        console.error('Error loading homepage data:', err);
        setError('Failed to load content. Please try again later.');
        
        // Fallback to empty arrays to prevent crashes
        setEvents([]);
        setNews([]);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    loadHomePageData();
  }, []);

  // Convert CMS data to component-expected format
  const convertEventData = (cmsEvent: CMSEvent) => ({
    id: cmsEvent.id,
    title: cmsEvent.title,
    date: new Date(cmsEvent.event_date),
    description: cmsEvent.description,
    location: cmsEvent.location,
    isMembers: cmsEvent.is_members_only
  });

  const convertNewsData = (cmsNews: CMSNewsArticle) => ({
    id: cmsNews.id,
    title: cmsNews.title,
    date: new Date(cmsNews.publish_date),
    summary: cmsNews.summary,
    content: cmsNews.content,
    image: cmsNews.image_url,
    isMembers: cmsNews.is_members_only
  });

  const convertTestimonialData = (cmsTestimonial: CMSTestimonial) => ({
    id: cmsTestimonial.id,
    name: cmsTestimonial.member_name,
    content: cmsTestimonial.content,
    image: cmsTestimonial.image_url
  });

  return (
    <>
      <SEOHead
        title="Radlett Lodge No. 6652 - Freemasons | Brotherhood, Charity & Tradition"
        description="Welcome to Radlett Lodge No. 6652, a Masonic Lodge in Hertfordshire under the United Grand Lodge of England. Discover our history, values, and how to join our brotherhood."
        keywords="Radlett Lodge 6652, Freemasonry, Hertfordshire, United Grand Lodge England, Masonic Lodge, Brotherhood, Charity, Tradition, Join Freemasons"
      />
      
      {/* Hero Section with Centered Logo */}
      <section 
        className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url('/masonic pillars (2).png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom center',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-primary-900 opacity-30"></div>
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center max-w-5xl">
          {/* Lodge Logo - Positioned Above Title */}
          <div className="mb-2 mt-24 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <img
              src="/LODGE PIC copy copy.png"
              alt="Radlett Lodge No. 6652 Logo"
              className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 mx-auto object-contain drop-shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                // Show fallback icon
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            {/* Fallback icon */}
            <div className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 mx-auto bg-secondary-500 rounded-full items-center justify-center hidden drop-shadow-2xl">
              <Building2 className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 text-primary-600" />
            </div>
          </div>

          {/* Title and Subtitle */}
          <div className="animate-fadeIn mt-4" style={{ animationDelay: '0.5s' }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-bold mb-6 leading-tight text-secondary-500 text-chiselled">
              Radlett Lodge No. 6652
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-white max-w-4xl mx-auto leading-relaxed">
              Integrity, Friendship, Respect and Service 
            </p>
            <p className="text-lg md:text-xl mb-10 text-secondary-100 max-w-3xl mx-auto">
              A Masonic Lodge Under the jurisdiction of United Grand Lodge of England
            </p>
          </div>

          {/* Call to Action Buttons - Moved Below Subtitle */}
          <div className="animate-fadeIn flex flex-col sm:flex-row justify-center gap-4 mb-10" style={{ animationDelay: '0.6s' }}>
            <Link to="/about">
              <Button variant="primary" size="lg" className="min-w-[200px]">
                Learn About Us
              </Button>
            </Link>
            <Link to="/join">
              <Button variant="outline" size="lg" className="min-w-[200px] border-white text-white hover:bg-white hover:text-primary-600">
                Join Our Lodge
              </Button>
            </Link>
          </div>

          {/* Key Information */}
          <div className="animate-fadeIn grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-48" style={{ animationDelay: '0.7s' }}>
            <div className="bg-primary-900 bg-opacity-15 backdrop-blur-sm rounded-lg p-6 border border-secondary-500 border-opacity-30 transform transition-all duration-300 hover:scale-105">
              <div className="text-secondary-400 mb-2">
                <Calendar className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Founded</h3>
              <p className="text-neutral-200">1948</p>
            </div>
            
            <div className="bg-primary-900 bg-opacity-15 backdrop-blur-sm rounded-lg p-6 border border-secondary-500 border-opacity-30 transform transition-all duration-300 hover:scale-105">
              <div className="text-secondary-400 mb-2">
                <Users className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Active Members</h3>
              <p className="text-neutral-200">28+</p>
            </div>
            
            <div className="bg-primary-900 bg-opacity-15 backdrop-blur-sm rounded-lg p-6 border border-secondary-500 border-opacity-30 transform transition-all duration-300 hover:scale-105">
              <div className="text-secondary-400 mb-2">
                <Heart className="w-8 h-8 mx-auto" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Charity Raised</h3>
              <p className="text-neutral-200">£50,000+ annually</p>
            </div>
          </div>
        </div>
      </section>

      {/* Countdown Timer Section - Uses Lodge Schedule */}
      <CountdownTimer useSchedule={true} />

      {/* Introduction Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-600 mb-6">Welcome to Our Lodge</h2>
              <p className="text-lg mb-6 text-neutral-600">
                Founded in 1948, Radlett Lodge No. 6652 is a vibrant Masonic Lodge operating under the United Grand Lodge of England within the Province of Hertfordshire.
              </p>
              <p className="text-lg mb-6 text-neutral-600">
                Our Lodge is committed to fostering personal development, ethical conduct, and charitable endeavors among our members while maintaining the rich traditions of Freemasonry.
              </p>
              <div className="mt-8">
                <Link to="/about">
                  <Button variant="primary">
                    Discover Our History
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/2928232/pexels-photo-2928232.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Masonic Temple Interior"
                className="rounded-lg shadow-medium w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-primary-800 font-heading font-bold text-xl">Since 1948</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title="Our Core Values" 
            subtitle="Freemasonry is founded on the principles of Brotherly Love, Relief, and Truth."
            centered
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-all duration-300 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary-100 text-primary-600 rounded-full mb-4">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-heading font-semibold text-primary-600 mb-3">Integrity</h3>
              <p className="text-neutral-600">
                Honesty, trust, honour, reliability, and conscience are the pillars of good character. They build integrity, earn trust, and reflect a life guided by strong values and consistent actions.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-all duration-300 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary-100 text-primary-600 rounded-full mb-4">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-heading font-semibold text-primary-600 mb-3">Friendship</h3>
              <p className="text-neutral-600">
                Freemasonry offers lifelong friendships with like-minded individuals, creating a strong sense of belonging, enjoyment, and fulfilment.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-all duration-300 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary-100 text-primary-600 rounded-full mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-heading font-semibold text-primary-600 mb-3">Respect</h3>
              <p className="text-neutral-600">
               Freemasonry has always valued its members' beliefs, promoting inclusivity, diversity, and mutual respect.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-all duration-300 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary-100 text-primary-600 rounded-full mb-4">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-heading font-semibold text-primary-600 mb-3">Service</h3>
              <p className="text-neutral-600">
                Helping others is at the heart of Freemasonry. Whether it's fundraising, volunteering, or supporting local causes, Freemasons are committed to making a difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Upcoming Events Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <SectionHeading 
              title="Upcoming Events" 
              subtitle="Join us at our upcoming meetings and social events."
            />
            <Link to="/events" className="inline-flex text-secondary-500 font-medium hover:text-secondary-600 transition-colors mt-4 md:mt-0">
              View All Events
            </Link>
          </div>
          
          {loading ? (
            <LoadingSpinner subtle={true} className="py-4" />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600">{error}</p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(event => (
                <EventCard key={event.id} event={convertEventData(event)} />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-lg p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="text-neutral-600">No upcoming events scheduled at this time.</p>
              <p className="text-sm text-neutral-500 mt-2">Check back soon for new events!</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-primary-50">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title="Member Experiences" 
            subtitle="Hear from some of our members about their Masonic journey."
            centered
          />
          
          {loading ? (
            <LoadingSpinner subtle={true} className="py-4" />
          ) : testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {testimonials.map(testimonial => (
                <TestimonialCard key={testimonial.id} testimonial={convertTestimonialData(testimonial)} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center mt-12">
              <Users className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="text-neutral-600">No testimonials available at this time.</p>
            </div>
          )}
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <SectionHeading 
              title="Latest News" 
              subtitle="Stay updated with the latest activities and announcements from our Lodge."
            />
            <Link to="/news" className="inline-flex text-secondary-500 font-medium hover:text-secondary-600 transition-colors mt-4 md:mt-0">
              View All News
            </Link>
          </div>
          
          {loading ? (
            <LoadingSpinner subtle={true} className="py-4" />
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map(newsItem => (
                <NewsCard key={newsItem.id} news={convertNewsData(newsItem)} />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-lg p-8 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="text-neutral-600">No news articles available at this time.</p>
              <p className="text-sm text-neutral-500 mt-2">Check back soon for updates!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
            Interested in Becoming a Freemason?
          </h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto text-neutral-100">
            Freemasonry offers a unique path of personal development, lifelong friendships, and the opportunity to make a positive difference in your community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/join">
              <Button variant="primary" size="lg">
                Learn How to Join
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;