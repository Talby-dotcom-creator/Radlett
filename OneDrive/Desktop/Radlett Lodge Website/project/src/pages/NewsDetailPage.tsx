import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { cmsApi } from '../lib/cmsApi';
import { CMSNewsArticle } from '../types';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [newsItem, setNewsItem] = useState<CMSNewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadNewsItem = async () => {
      if (!id) {
        setError('No article ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get all news articles and find the one with matching ID
        const newsData = await cmsApi.getNewsArticles();
        const article = newsData.find(item => item.id === id && item.is_published);
        
        if (article) {
          setNewsItem(article);
        } else {
          setError('Article not found or not published');
        }
      } catch (err) {
        console.error('Error loading news article:', err);
        setError('Failed to load article. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadNewsItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center py-12">
          <LoadingSpinner subtle={true} />
        </div>
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className="min-h-screen pt-28 pb-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
          <h1 className="text-3xl font-heading font-bold text-primary-600 mb-6">
            {error || 'News Article Not Found'}
          </h1>
          <p className="text-neutral-600 mb-8">
            The news article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/news">
            <Button>Return to News</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <Link to="/news" className="inline-flex items-center text-secondary-500 hover:text-secondary-600 transition-colors mb-6">
          <ArrowLeft size={18} className="mr-2" />
          Back to News
        </Link>
        
        <article>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-600 mb-4">
            {newsItem.title}
          </h1>
          
          <div className="flex items-center mb-6 text-sm text-neutral-500">
            <Calendar size={16} className="mr-1.5 text-secondary-500" />
            <span>{format(new Date(newsItem.publish_date), 'dd/MM/yyyy')}</span>
            {newsItem.is_members_only && (
              <>
                <span className="mx-2">•</span>
                <span className="bg-primary-100 text-primary-600 px-2 py-1 rounded text-xs font-medium">
                  Members Only
                </span>
              </>
            )}
          </div>
          
          {newsItem.image_url && (
            <img
              src={newsItem.image_url}
              alt={newsItem.title}
              className="w-full h-auto object-contain rounded-lg shadow-medium mb-8 max-h-96"
            />
          )}
          
          {/* Summary */}
          <div className="bg-neutral-50 rounded-lg p-6 mb-8">
            <p className="text-lg text-neutral-700 font-medium">{newsItem.summary}</p>
          </div>
          
          {/* Content */}
          <div 
            className="prose max-w-none text-neutral-600"
            dangerouslySetInnerHTML={{ __html: newsItem.content }}
          />
          
          <div className="mt-8 pt-8 border-t border-neutral-200">
            <Link to="/news">
              <Button variant="outline">
                View All News
              </Button>
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
};

export default NewsDetailPage;