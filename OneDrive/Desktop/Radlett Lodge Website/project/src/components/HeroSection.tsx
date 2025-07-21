import React from 'react';
import { ChevronDown } from 'lucide-react';
import Button from './Button';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage: string;
  overlayOpacity?: number;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  backgroundImage,
  overlayOpacity = 0.6,
}) => {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      className="relative h-screen flex items-center justify-center text-center text-white overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-primary-900" 
        style={{ opacity: overlayOpacity }}
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 max-w-4xl">
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 animate-fadeIn"
          style={{ animationDelay: '0.3s' }}
        >
          {title}
        </h1>
        <p 
          className="text-xl md:text-2xl mb-8 text-neutral-50 max-w-2xl mx-auto animate-fadeIn"
          style={{ animationDelay: '0.6s' }}
        >
          {subtitle}
        </p>
        {ctaText && ctaLink && (
          <div className="animate-fadeIn" style={{ animationDelay: '0.9s' }}>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => window.location.href = ctaLink}
            >
              {ctaText}
            </Button>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer animate-bounce"
        onClick={scrollToContent}
      >
        <ChevronDown className="w-10 h-10 text-neutral-50" />
      </div>
    </section>
  );
};

export default HeroSection;