import React from 'react';
import { EventType } from '../types';

interface EventBadgeProps {
  type: EventType;
  label: string;
  onClick?: () => void;
}

const EventBadge: React.FC<EventBadgeProps> = ({ type, label, onClick }) => {
  if (!label) return null;

  let baseClasses = "text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all duration-200 block w-full text-left truncate ";
  
  if (onClick) {
    baseClasses += "cursor-pointer hover:shadow-sm active:scale-95 ";
  }

  if (label.includes("Degree")) {
    baseClasses += "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100";
  } else {
    switch (type) {
      case EventType.BANK_HOLIDAY:
        baseClasses += "bg-red-50 text-red-700 border-red-100 hover:bg-red-100";
        break;
      
      case EventType.MEETING_ALDENHAM:
        baseClasses += "bg-blue-600 text-white border-blue-700 shadow-sm hover:bg-blue-700";
        break;
      case EventType.MEETING_RADLETT:
        baseClasses += "bg-emerald-600 text-white border-emerald-700 shadow-sm hover:bg-emerald-700";
        break;
      case EventType.MEETING_ELSTREE:
        baseClasses += "bg-amber-500 text-white border-amber-600 shadow-sm hover:bg-amber-600";
        break;

      case EventType.OFFICERS_ALDENHAM:
        baseClasses += "bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100/50";
        break;
      case EventType.OFFICERS_RADLETT:
        baseClasses += "bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100/50";
        break;
      case EventType.OFFICERS_ELSTREE:
        baseClasses += "bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100/50";
        break;

      case EventType.RECESS:
        baseClasses += "bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed italic";
        break;
        
      default:
        baseClasses += "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200";
    }
  }

  return (
    <button onClick={type === EventType.RECESS ? undefined : onClick} className={baseClasses} type="button">
      {label}
    </button>
  );
};

export default EventBadge;