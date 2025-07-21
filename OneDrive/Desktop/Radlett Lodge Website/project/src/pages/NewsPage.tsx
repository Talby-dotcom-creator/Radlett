import React, { useState, useEffect } from 'react';
import { Search, BookOpen } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import SectionHeading from '../components/SectionHeading';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { optimizedApi as cmsApi } from '../lib/optimizedApi';
import { CMSNewsArticle } from '../types';

const NewsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [news, setNews] = useState<CMSNewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const newsData = await cmsApi.getNewsArticles();
        // Filter for published articles only
        const publishedNews = newsData.filter(article => article.is_published);
        setNews(publishedNews);
      } catch (err) {
        console.error('Error loading news:', err);
        setError('Failed to load news articles. Please try again later.');
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  // Convert CMS news to component format
  const convertNewsData = (cmsNews: CMSNewsArticle) => ({
    id: cmsNews.id,
    title: cmsNews.title,
    date: new Date(cmsNews.publish_date),
    summary: cmsNews.summary,
    content: cmsNews.content,
    image: cmsNews.image_url,
    isMembers: cmsNews.is_members_only
  });
  
  // Filter news based on search term
  const filteredNews = news.filter(newsItem => 
    newsItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    newsItem.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    newsItem.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort by date (newest first)
  const sortedNews = [...filteredNews].sort((a, b) => 
    new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
  );
  
  return (
    <>
      <HeroSection
        title="News & Updates"
        subtitle="Stay informed about the latest activities and announcements from Radlett Lodge"
        backgroundImage="https://images.pexels.com/photos/7078666/pexels-photo-7078666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title="Latest News" 
            subtitle="Keeping you updated with the activities and achievements of our Lodge."
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="mb-10 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-neutral-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            </div>
          </div>
          
          {/* News Grid */}
          {loading ? (
            <LoadingSpinner subtle={true} className="py-4" />
          ) : sortedNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedNews.map(newsItem => (
                <NewsCard key={newsItem.id} news={convertNewsData(newsItem)} />
              ))}
            </div>
          ) : searchTerm ? (
            <div className="bg-neutral-50 p-8 rounded-lg text-center">
              <Search className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="text-neutral-600">No news articles found matching your search.</p>
              <p className="text-sm text-neutral-500 mt-2">Try different keywords or browse all articles.</p>
            </div>
          ) : (
            <div className="bg-neutral-50 p-8 rounded-lg text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
              <p className="text-neutral-600">No news articles available at this time.</p>
              <p className="text-sm text-neutral-500 mt-2">Check back soon for updates!</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default NewsPage;