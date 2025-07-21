import React from 'react';
import { Quote } from 'lucide-react';
import { Testimonial } from '../types';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial }) => {
  const { name, content, image } = testimonial;
  
  return (
    <div className="bg-white shadow-soft rounded-lg p-6 border border-neutral-100 relative">
      <Quote className="absolute top-4 right-4 w-10 h-10 text-secondary-100" />
      <div className="text-neutral-600 mb-6 relative z-10">{content}</div>
      <div className="flex items-center">
        {image && (
          <img 
            src={image} 
            alt={name} 
            className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-secondary-500"
          />
        )}
        <div>
          <h4 className="font-heading font-semibold text-primary-600">{name}</h4>
          <p className="text-sm text-neutral-500">Member</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;