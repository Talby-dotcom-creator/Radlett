import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, Crown } from 'lucide-react';
import { cmsApi } from '../lib/cmsApi';
import LoadingSpinner from './LoadingSpinner';

interface CountdownTimerProps {
  targetDate?: string;
  eventTitle?: string;
  eventLocation?: string;
  useSchedule?: boolean; // New prop to use Lodge schedule
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetDate, 
  eventTitle,
  eventLocation,
  useSchedule = true // Default to using Lodge schedule
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [nextMeeting, setNextMeeting] = useState<{
    id?: string;
    is_members_only?: boolean;
    date: Date;
    title: string;
    description: string;
    location: string;
    isInstallation: boolean;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  // Calculate next Lodge meeting based on schedule
  const calculateNextLodgeMeeting = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Lodge meeting schedule: 2nd Sat Dec, 2nd Sat Feb, 1st Sat Apr, 2nd Sat Jul, 1st Sat Sep
    const meetings = [];
    
    // Helper function to get nth weekday of month
    const getNthWeekday = (year: number, month: number, weekday: number, occurrence: number) => {
      const firstDay = new Date(year, month, 1);
      const firstWeekday = firstDay.getDay();
      let firstOccurrence = 1 + (weekday - firstWeekday + 7) % 7;
      const targetDate = firstOccurrence + (occurrence - 1) * 7;
      return new Date(year, month, targetDate, 18, 0); // 6:00 PM
    };
    
    // Generate meetings for current and next year
    for (const year of [currentYear, currentYear + 1]) {
      // February - 2nd Saturday
      meetings.push({
        date: getNthWeekday(year, 1, 6, 2),
        title: "Regular Lodge Meeting",
        description: "February regular meeting of Radlett Lodge No. 6652. Festive Board to follow.",
        location: "Radlett Masonic Centre, Rose Walk, Radlett",
        isInstallation: false
      });
      
      // April - 1st Saturday
      meetings.push({
        date: getNthWeekday(year, 3, 6, 1),
        title: "Regular Lodge Meeting", 
        description: "April regular meeting of Radlett Lodge No. 6652. Festive Board to follow.",
        location: "Radlett Masonic Centre, Rose Walk, Radlett",
        isInstallation: false
      });
      
      // July - 2nd Saturday
      meetings.push({
        date: getNthWeekday(year, 6, 6, 2),
        title: "Regular Lodge Meeting",
        description: "July regular meeting of Radlett Lodge No. 6652. Festive Board to follow.",
        location: "Radlett Masonic Centre, Rose Walk, Radlett", 
        isInstallation: false
      });
      
      // September - 1st Saturday
      meetings.push({
        date: getNthWeekday(year, 8, 6, 1),
        title: "Regular Lodge Meeting",
        description: "September regular meeting of Radlett Lodge No. 6652. Festive Board to follow.",
        location: "Radlett Masonic Centre, Rose Walk, Radlett",
        isInstallation: false
      });
      
      // December - 2nd Saturday (Installation)
      meetings.push({
        date: getNthWeekday(year, 11, 6, 2),
        title: "Installation Meeting",
        description: "Annual Installation of the Worshipful Master and Officers. Festive Board to follow.",
        location: "Radlett Masonic Centre, Rose Walk, Radlett",
        isInstallation: true
      });
    }
    
    // Find next meeting
    const nextMeeting = meetings
      .filter(meeting => meeting.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
    
    return nextMeeting || null;
  };

  // Fetch next event from CMS
  const fetchNextEvent = useCallback(async () => {
    try {
      setLoading(true);
      const nextEvent = await cmsApi.getNextUpcomingEvent();
      
      if (nextEvent) {
        // Convert CMS event to the format expected by the component
        return {
          id: nextEvent.id,
          date: new Date(nextEvent.event_date),
          title: nextEvent.title,
          description: nextEvent.description,
          location: nextEvent.location,
          isInstallation: nextEvent.title.toLowerCase().includes('installation'),
          is_members_only: nextEvent.is_members_only
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching next event:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Determine which date to use
    const loadMeetingData = async () => {
      let targetMeeting = null;
      
      if (useSchedule) {
        // Try to get the next event from CMS first
        targetMeeting = await fetchNextEvent();
        
        // Fall back to calculated meeting if no CMS event
        if (!targetMeeting) {
          targetMeeting = calculateNextLodgeMeeting();
        }
        
        setNextMeeting(targetMeeting);
      }
      
      const finalTargetDate = targetMeeting?.date || (targetDate ? new Date(targetDate) : null);
      
      if (!finalTargetDate) {
        setIsExpired(true);
        return;
      }

    const calculateTimeLeft = () => {
      const difference = finalTargetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    // Calculate immediately
    calculateTimeLeft();
    
      // Update every second
      const timer = setInterval(calculateTimeLeft, 1000);
      
      return () => clearInterval(timer);
    };
    
    loadMeetingData();
  }, [targetDate, useSchedule, fetchNextEvent]);

  // Use meeting data from CMS or fallback to props
  const displayTitle = nextMeeting?.title || eventTitle || "Next Lodge Meeting";
  const displayLocation = nextMeeting?.location || eventLocation;
  const isInstallation = nextMeeting?.isInstallation || false;

  if (isExpired) {
    return (
      <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-700 bg-opacity-50">
            <LoadingSpinner subtle={true} className="text-white" />
          </div>
        )}
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-secondary-500" />
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">
              Meeting Concluded
            </h2>
            <p className="text-lg text-neutral-100">
              Check our Events page for the next scheduled meeting
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Show simple "days to go" if more than 1 day
  if (timeLeft.days > 1) {
    return (
      <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary-700 bg-opacity-50">
            <LoadingSpinner subtle={true} className="text-white" />
          </div>
        )}
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            {isInstallation ? (
              <Crown className="w-16 h-16 mx-auto mb-4 text-secondary-500" />
            ) : (
              <Calendar className="w-16 h-16 mx-auto mb-4 text-secondary-500" />
            )}
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">
              {displayTitle}
            </h2>
            {isInstallation && (
              <p className="text-lg text-secondary-300 mb-4">
                Annual Installation Ceremony
              </p>
            )}
            <div className="text-5xl md:text-6xl font-heading font-bold text-secondary-500 mb-4">
              {timeLeft.days}
            </div>
            {nextMeeting?.is_members_only && (
              <div className="inline-block bg-primary-500 text-white text-xs px-3 py-1 rounded-full mb-2">
                <span className="font-medium">Members Only</span>
              </div>
            )}
            
            <p className="text-xl mb-2">
              {timeLeft.days === 1 ? 'Day to Go' : 'Days to Go'}
            </p>
            {displayLocation && (
              <div className="flex items-center justify-center text-neutral-100 mt-4">
                <MapPin size={18} className="mr-2" />
                <span>{displayLocation}</span>
              </div>
            )}
            {nextMeeting && (
              <div className="mt-4 text-neutral-100">
                <p className="text-sm">
                  {nextMeeting.date.toLocaleDateString('en-GB')} at {nextMeeting.date.toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Show detailed countdown if within 24 hours
  return (
    <section className="py-12 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary-700 bg-opacity-50">
          <LoadingSpinner subtle={true} className="text-white" />
        </div>
      )}
      <div className="container mx-auto px-4 md:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {isInstallation ? (
            <Crown className="w-16 h-16 mx-auto mb-4 text-secondary-500" />
          ) : (
            <Clock className="w-16 h-16 mx-auto mb-4 text-secondary-500" />
          )}
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">
            {displayTitle}
          </h2>
          {isInstallation && (
            <p className="text-lg text-secondary-300 mb-4">
              Annual Installation Ceremony
            </p>
          )}
          
          {nextMeeting?.is_members_only && (
            <div className="inline-block bg-primary-500 text-white text-xs px-3 py-1 rounded-full mb-2">
              <span className="font-medium">Members Only</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-heading font-bold text-secondary-500">
                {timeLeft.days}
              </div>
              <div className="text-sm md:text-base text-neutral-100">
                {timeLeft.days === 1 ? 'Day' : 'Days'}
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-heading font-bold text-secondary-500">
                {timeLeft.hours.toString().padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base text-neutral-100">
                {timeLeft.hours === 1 ? 'Hour' : 'Hours'}
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-heading font-bold text-secondary-500">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base text-neutral-100">
                {timeLeft.minutes === 1 ? 'Minute' : 'Minutes'}
              </div>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl md:text-4xl font-heading font-bold text-secondary-500">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </div>
              <div className="text-sm md:text-base text-neutral-100">
                {timeLeft.seconds === 1 ? 'Second' : 'Seconds'}
              </div>
            </div>
          </div>
          
          {displayLocation && (
            <div className="flex items-center justify-center text-neutral-50 mb-2">
              <MapPin size={18} className="mr-2" />
              <span>{displayLocation}</span>
            </div>
          )}
          
          {nextMeeting && (
            <div className="text-neutral-100">
              <p className="text-sm">
                {nextMeeting.date.toLocaleDateString('en-GB')} at {nextMeeting.date.toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CountdownTimer;