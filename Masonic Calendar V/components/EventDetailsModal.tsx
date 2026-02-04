import React from 'react';
import { CalendarEvent, EventType } from '../types';

interface EventDetailsModalProps {
  event: CalendarEvent;
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({ event, onClose }) => {
  const dateStr = event.date.toLocaleDateString('en-GB', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Colour Bar */}
        <div className={`h-4 w-full ${getHeaderColour(event.type, event.label)}`} />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
             <h2 className="text-xl font-bold text-slate-900 leading-snug pr-8">
               {event.label}
             </h2>
             <button 
               onClick={onClose}
               className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-full hover:bg-slate-100 transition-colors"
               aria-label="Close details"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-slate-600">
              <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">{dateStr}</span>
            </div>

            {event.time && (
              <div className="flex items-center text-slate-600">
                <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{event.time}</span>
              </div>
            )}

            {event.description && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                 <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Details</h3>
                 <p className="text-slate-700 leading-relaxed">
                   {event.description}
                 </p>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const getHeaderColour = (type: EventType, label: string): string => {
  if (label.includes("Degree")) return "bg-purple-500";
  switch (type) {
    case EventType.BANK_HOLIDAY: return "bg-red-500";
    case EventType.MEETING_ALDENHAM: return "bg-blue-500";
    case EventType.MEETING_RADLETT: return "bg-emerald-500";
    case EventType.MEETING_ELSTREE: return "bg-amber-500";
    case EventType.OFFICERS_ALDENHAM: return "bg-blue-300";
    case EventType.OFFICERS_RADLETT: return "bg-emerald-300";
    case EventType.OFFICERS_ELSTREE: return "bg-amber-300";
    default: return "bg-slate-500";
  }
};

export default EventDetailsModal;
