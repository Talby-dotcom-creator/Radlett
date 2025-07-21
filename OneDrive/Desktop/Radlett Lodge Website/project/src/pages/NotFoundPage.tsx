import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="text-9xl font-bold text-neutral-100">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-4xl font-heading font-bold text-primary-600">Page Not Found</h1>
            </div>
          </div>
          
          <p className="text-lg text-neutral-600 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <Link to="/">
            <Button variant="primary" className="inline-flex items-center">
              <Home size={18} className="mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;