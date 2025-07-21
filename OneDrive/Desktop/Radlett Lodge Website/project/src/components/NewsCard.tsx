import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { NewsItem } from '../types';
import { Link } from 'react-router-dom';

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const { id, title, date, summary, image } = news;
  
  return (
    <Link 
      to={`/news/${id}`}
      className="group block bg-white shadow-soft rounded-lg overflow-hidden transition-all duration-300 hover:shadow-medium border border-neutral-100 h-full"
    >
      {image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center mb-3 text-sm text-neutral-500">
          <Calendar size={16} className="mr-1.5 text-secondary-500" />
          <span>{format(date, 'dd/MM/yyyy')}</span>
        </div>
        <h3 className="text-xl font-heading font-semibold text-primary-600 group-hover:text-secondary-500 transition-colors mb-3">{title}</h3>
        <p className="text-neutral-600">{summary}</p>
        <div className="mt-4 text-secondary-500 font-medium text-sm group-hover:text-secondary-600 transition-colors">
          Read more
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;