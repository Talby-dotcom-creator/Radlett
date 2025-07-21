import React from 'react';
import { Calendar, Clock, MapPin, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '../types';
import Button from './Button';

interface EventCardProps {
  event: Event;
  detailed?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, detailed = false }) => {
  const { title, date, description, location, isMembers } = event;
  
  return (
    <div className="bg-white shadow-soft rounded-lg overflow-hidden border border-neutral-100 transition-all duration-300 hover:shadow-medium">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-heading font-semibold text-primary-600">{title}</h3>
          {isMembers && (
            <div className="flex items-center text-xs font-medium bg-primary-100 text-primary-600 px-2 py-1 rounded">
              <Lock size={12} className="mr-1" />
              Members Only
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-neutral-500">
          <div className="flex items-center">
            <Calendar size={16} className="mr-1.5 text-secondary-500" />
            <span>{format(date, 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex items-center">
            <Clock size={16} className="mr-1.5 text-secondary-500" />
            <span>{format(date, 'h:mm a')}</span>
          </div>
        </div>
        
        <div className="flex items-start mt-3">
          <MapPin size={16} className="mr-1.5 text-secondary-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-neutral-500">{location}</span>
        </div>
        
        {detailed ? (
          <div className="mt-4 text-neutral-600">
            <p>{description}</p>
          </div>
        ) : (
          <p className="mt-4 text-neutral-600 line-clamp-2">{description}</p>
        )}
        
        {!detailed && (
          <div className="mt-5">
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;