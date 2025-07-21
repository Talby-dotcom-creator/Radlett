import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FAQ } from '../types';

interface FaqItemProps {
  faq: FAQ;
}

const FaqItem: React.FC<FaqItemProps> = ({ faq }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-neutral-200 last:border-b-0">
      <button
        className="w-full flex justify-between items-center py-4 px-1 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-primary-600 font-heading">{faq.question}</h3>
        <span className="ml-4 flex-shrink-0 text-secondary-500">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pb-4 px-1 text-neutral-600">
          {faq.answer}
        </div>
      </div>
    </div>
  );
};

export default FaqItem;