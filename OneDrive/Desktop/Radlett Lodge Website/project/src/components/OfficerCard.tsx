import React from 'react';
import { Officer } from '../types';

interface OfficerCardProps {
  officer: Officer;
}

const OfficerCard: React.FC<OfficerCardProps> = ({ officer }) => {
  const { position, name, image } = officer;
  
  return (
    <div className="bg-white shadow-soft rounded-lg overflow-hidden border border-neutral-100 transition-all duration-300 hover:shadow-medium">
      {image && (
        <div className="aspect-square overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4 text-center">
        <h3 className="font-heading font-semibold text-primary-600">{name}</h3>
        <p className="text-sm text-neutral-500">{position}</p>
      </div>
    </div>
  );
};

export default OfficerCard;