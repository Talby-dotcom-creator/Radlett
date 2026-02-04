import { useMemo, useState, useEffect, useRef } from 'react';
import { generateCalendarData, getMonthName, generateICS } from './utils/dateLogic';
import MonthCard from './components/MonthCard';
import EventDetailsModal from './components/EventDetailsModal';
import ShareModal from './components/ShareModal';
import { CalendarEvent } from './types';

const App: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear() > 2025 ? new Date().getFullYear() : 2026);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, ALDENHAM, RADLETT, ELSTREE, LOI

  const events = useMemo(() => generateCalendarData(year), [year]);
  const monthRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return events.filter((evt: CalendarEvent) => {
        const searchLower = searchTerm.toLowerCase().trim();
        if (searchLower === '') return filterType === 'ALL' || checkTypeMatch(evt, filterType);

        // Date variations for searching
        const day = evt.date.getDate();
        const month = evt.date.getMonth() + 1;
        const monthName = getMonthName(year, evt.date.getMonth());
        const shortMonthName = monthName.substring(0, 3);
        
        const getSuffix = (d: number) => {
          if (d > 3 && d < 21) return 'th';
          switch (d % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
          }
        };

        const suffix = getSuffix(day);

        // Construct a string of searchable terms focused on UK formats (Day before Month)
        const searchableTerms = [
            evt.label,
            evt.description,
            evt.time,
            monthName,
            shortMonthName,
            `${day}`,                        // "15"
            `${day}${suffix}`,               // "15th"
            `${day}/${month}`,               // "15/8"
            `${day}/${month}/${year}`,        // "15/8/2026"
            `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`, // "15/08"
            `${day} ${monthName}`,           // "15 August"
            `${day}${suffix} ${monthName}`,  // "15th August"
            `${day} ${shortMonthName}`,      // "15 Aug"
            `${day}${suffix} ${shortMonthName}` // "15th Aug"
        ].filter(Boolean).join(' ').toLowerCase();

        const textMatch = searchableTerms.includes(searchLower);
        if (!textMatch) return false;

        // Apply secondary Type Filter
        return checkTypeMatch(evt, filterType);
    });
  }, [events, searchTerm, filterType, year]);

  // Helper to check category filter
  function checkTypeMatch(evt: CalendarEvent, type: string) {
    if (type === 'ALL') return true;
    if (type === 'ALDENHAM') return evt.label.includes('Aldenham');
    if (type === 'RADLETT') return evt.label.includes('Radlett');
    if (type === 'ELSTREE') return evt.label.includes('Elstree');
    if (type === 'LOI') return evt.label.includes('LoI') || evt.label.includes('Degree') || evt.label.includes('Officers');
    return true;
  }

  // Upcoming Event Spotlight
  const upcomingEvent = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return events.find(e => e.date >= today && e.label !== '' && !e.label.includes('Centre Closed'));
  }, [events]);

  // Statistics
  const stats = useMemo(() => {
    return {
        meetings: filteredEvents.filter(e => e.isMeeting).length,
        loi: filteredEvents.filter(e => e.label.includes('Degree') || e.label.includes('AGM')).length,
        officers: filteredEvents.filter(e => e.label.includes('Officers')).length
    };
  }, [filteredEvents]);

  const eventsByMonth = useMemo(() => {
    const grouped: CalendarEvent[][] = Array.from({ length: 12 }, () => []);
    filteredEvents.forEach((evt: CalendarEvent) => {
      grouped[evt.date.getMonth()].push(evt);
    });
    return grouped;
  }, [filteredEvents]);

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setFilterType('ALL');
  };

  const handleJumpToToday = (): void => {
    const now = new Date();
    if (now.getFullYear() === year) {
        const monthIndex = now.getMonth();
        monthRefs.current[monthIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        setYear(now.getFullYear());
        setTimeout(() => {
            monthRefs.current[now.getMonth()]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
  };

  const handlePrint = (): void => window.print();

  const handleDownloadICS = (): void => {
    const icsContent = generateICS(events);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `masonic-calendar-${year}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 pb-12 print:bg-white print:pb-0">
      {/* WEB ONLY Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
               <button onClick={() => setYear(y => y - 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all font-bold">&larr;</button>
               <span className="bg-slate-900 text-white font-bold py-1 px-3 rounded-md text-lg min-w-[3.5rem] text-center">{year}</span>
               <button onClick={() => setYear(y => y + 1)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all font-bold">&rarr;</button>
             </div>
             <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Masonic Calendar</h1>
             </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={handleJumpToToday} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-2 rounded-md transition-colors">Today</button>
            <button onClick={() => setShowShareModal(true)} className="p-2 text-slate-500 hover:text-indigo-600 transition-colors" title="Share"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
            <button onClick={handlePrint} className="p-2 text-slate-500 hover:text-indigo-600 transition-colors" title="Print"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg></button>
            <button onClick={handleDownloadICS} className="hidden lg:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95">Download .ics</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Spotlight & Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:hidden">
            
            {/* Upcoming Spotlight */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors duration-700" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300 mb-1 block">Next Scheduled Event</span>
                        {upcomingEvent ? (
                            <>
                                <h2 className="text-2xl font-bold mb-1 truncate">{upcomingEvent.label}</h2>
                                <p className="text-indigo-100/80 text-sm font-medium">
                                    {upcomingEvent.date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    {upcomingEvent.time && ` @ ${upcomingEvent.time}`}
                                </p>
                            </>
                        ) : (
                            <p className="text-xl font-bold opacity-50 italic">No upcoming events</p>
                        )}
                    </div>
                    {upcomingEvent && (
                        <button 
                            onClick={() => setSelectedEvent(upcomingEvent)}
                            className="mt-6 self-start bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            View Details
                        </button>
                    )}
                </div>
            </div>

            {/* Controls Dashboard */}
            <div className="lg:col-span-7 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                    {/* Search & Stats */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-64 group/search">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </span>
                            <input 
                                type="text" 
                                placeholder="Search events or date (e.g. 15/08, 7th Sept)..." 
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-10 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50/50 hover:bg-slate-50 focus:bg-white"
                            />
                            {searchTerm && (
                                <button 
                                  onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <div className="flex flex-col items-center"><span className="text-slate-900 text-lg leading-none">{stats.meetings}</span><span>Meetings</span></div>
                            <div className="flex flex-col items-center"><span className="text-slate-900 text-lg leading-none">{stats.officers}</span><span>Officers</span></div>
                            <div className="flex flex-col items-center"><span className="text-slate-900 text-lg leading-none">{stats.loi}</span><span>LoI</span></div>
                        </div>
                    </div>

                    {/* Interactive Legend Filters */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'ALL', label: 'All', color: 'bg-slate-400' },
                            { id: 'ALDENHAM', label: 'Aldenham', color: 'bg-blue-500' },
                            { id: 'RADLETT', label: 'Radlett', color: 'bg-emerald-500' },
                            { id: 'ELSTREE', label: 'Elstree', color: 'bg-amber-500' },
                            { id: 'LOI', label: 'Degrees/LoI', color: 'bg-purple-500' }
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilterType(btn.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    filterType === btn.id 
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10' 
                                    : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'
                                }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${btn.color}`} />
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Global Empty State */}
        {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-slate-100 p-6 rounded-full text-slate-300 mb-2">
                    <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900">No matching events found</h3>
                    <p className="text-slate-500 mt-1">Try searching for a date in UK format (e.g. "7th Sept" or "15/08").</p>
                </div>
                <button 
                    onClick={handleClearFilters}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors"
                >
                    Clear All Filters
                </button>
            </div>
        ) : (
            /* Calendar Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4">
              {eventsByMonth.map((monthEvents, index) => (
                <div 
                    key={`${year}-${index}`} 
                    ref={el => { monthRefs.current[index] = el; }}
                    className="transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <MonthCard 
                      monthName={getMonthName(year, index)} 
                      events={monthEvents} 
                      onEventClick={setSelectedEvent}
                    />
                </div>
              ))}
            </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-12 border-t border-slate-100 text-center space-y-4 print:hidden">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">&copy; {year} Masonic Calendar &bull; Brethren's Utility Tool</p>
      </footer>

      {selectedEvent && (
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}

      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};

export default App;