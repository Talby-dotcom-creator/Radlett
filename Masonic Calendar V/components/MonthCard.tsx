import React from 'react';
import { CalendarEvent, EventType } from '../types';
import EventBadge from './EventBadge';

interface MonthCardProps {
  monthName: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const MonthCard: React.FC<MonthCardProps> = ({ monthName, events, onEventClick }) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const isToday = (date: Date) => {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d.getTime() === today.getTime();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full print:h-auto print:overflow-visible print:border-slate-300 print:shadow-none print:break-inside-avoid hover:shadow-md transition-shadow group">
      <div className="bg-slate-50/50 border-b border-slate-100 p-4 print:bg-slate-100 print:py-2 print:px-3">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] text-center print:text-base group-hover:text-slate-900 transition-colors">
          {monthName}
        </h2>
      </div>
      <div className="p-4 flex-grow overflow-y-auto print:overflow-visible print:h-auto print:p-2">
        {events.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-8 opacity-20 grayscale">
               <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               <p className="text-xs font-bold uppercase tracking-widest">Quiet Month</p>
           </div>
        ) : (
        <ul className="space-y-4 print:space-y-1">
          {events.map((evt) => {
            const dayNum = evt.date.getDate();
            const dayName = evt.date.toLocaleString('en-GB', { weekday: 'short' });
            
            const suffix = (dayNum: number) => {
              if (dayNum > 3 && dayNum < 21) return 'th';
              switch (dayNum % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
              }
            };

            const isMonday = evt.date.getDay() === 1;
            const isBankHoliday = evt.type === EventType.BANK_HOLIDAY;
            const isTodayDate = isToday(evt.date);

            let dateColorClass = "text-slate-400";
            if (isBankHoliday) dateColorClass = "text-red-500 font-bold";
            else if (!isMonday || evt.isMeeting) dateColorClass = "text-slate-900 font-bold";
            
            let rowBgClass = "border-l-4 border-transparent";
            if (evt.type === EventType.MEETING_ALDENHAM) rowBgClass = "border-l-4 border-blue-500 bg-blue-50/20";
            if (evt.type === EventType.MEETING_RADLETT) rowBgClass = "border-l-4 border-emerald-500 bg-emerald-50/20";
            if (evt.type === EventType.MEETING_ELSTREE) rowBgClass = "border-l-4 border-amber-500 bg-amber-50/20";
            
            if (isTodayDate) {
                rowBgClass = "border-l-4 border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-100";
            }

            return (
              <li key={evt.id} className={`flex flex-col py-1 px-2 rounded-r-xl transition-colors ${rowBgClass}`}>
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-center min-w-[2rem]">
                    <span className={`text-[10px] uppercase font-bold ${!isMonday ? 'text-slate-900' : 'text-slate-400'} opacity-60`}>
                        {dayName}
                    </span>
                    <span className={`text-lg leading-none ${dateColorClass}`}>
                        {dayNum}<span className="text-[10px] align-top font-normal opacity-50 ml-0.5">{suffix(dayNum)}</span>
                    </span>
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    {evt.label && (
                        <EventBadge 
                          type={evt.type} 
                          label={evt.label} 
                          onClick={() => onEventClick(evt)}
                        />
                    )}
                  </div>

                  {isTodayDate && (
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse print:hidden" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        )}
      </div>
    </div>
  );
};

export default MonthCard;