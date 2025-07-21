import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import Calendar from 'react-calendar';
import HeroSection from '../components/HeroSection';
import SectionHeading from '../components/SectionHeading';
import EventCard from '../components/EventCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { optimizedApi as cmsApi } from '../lib/optimizedApi';
import { CMSEvent } from '../types';
import 'react-calendar/dist/Calendar.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Value>(null);
  const [showPublicOnly, setShowPublicOnly] = useState(false);
  const [events, setEvents] = useState<CMSEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const eventsData = await cmsApi.getEvents();
        setEvents(eventsData);
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again later.');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Convert CMS event to component format
  const convertEventData = (cmsEvent: CMSEvent) => ({
    id: cmsEvent.id,
    title: cmsEvent.title,
    date: new Date(cmsEvent.event_date),
    description: cmsEvent.description,
    location: cmsEvent.location,
    isMembers: cmsEvent.is_members_only
  });
  
  // Filter events based on selections
  const filteredEvents = events.filter(event => {
    // Filter by public/members
    if (showPublicOnly && event.is_members_only) {
      return false;
    }
    
    // Filter by selected date if any
    if (selectedDate instanceof Date) {
      const eventDate = new Date(event.event_date);
      return eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear();
    }
    
    return true;
  });
  
  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
  );
  
  const futureEvents = sortedEvents.filter(event => 
    new Date(event.event_date).getTime() >= new Date().setHours(0, 0, 0, 0)
  );
  
  const pastEventsFiltered = sortedEvents
    .filter(event => 
      new Date(event.event_date).getTime() < new Date().setHours(0, 0, 0, 0)
    )
    .sort((a, b) => 
      new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );
  
  // Get dates that have events for highlighting in calendar
  const eventDates = events.map(event => new Date(event.event_date));
  
  return (
    <>
      <HeroSection
        title="Events Calendar"
        subtitle="Stay up to date with all Lodge meetings and social events"
        backgroundImage="https://images.pexels.com/photos/6044226/pexels-photo-6044226.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      />

      {/* Events Filter and Calendar */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading 
            title="Find Events" 
            subtitle="Use the calendar and filters to find events that interest you."
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-neutral-50 rounded-lg p-6 shadow-soft">
                <div className="mb-6">
                  <h3 className="text-xl font-heading font-semibold text-primary-600 mb-4 flex items-center">
                    <Filter size={20} className="mr-2 text-secondary-500" />
                    Filters
                  </h3>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="public-only"
                      checked={showPublicOnly}
                      onChange={(e) => setShowPublicOnly(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="public-only" className="text-neutral-600">
                      Show public events only
                    </label>
                  </div>
                  {selectedDate && (
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedDate(null)}
                      >
                        Clear Date Filter
                      </Button>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-heading font-semibold text-primary-600 mb-4 flex items-center">
                    <CalendarIcon size={20} className="mr-2 text-secondary-500" />
                    Calendar
                  </h3>
                  <div className="calendar-container">
                    <Calendar
                      onChange={setSelectedDate}
                      value={selectedDate}
                      tileClassName={({ date }) => 
                        eventDates.some(eventDate => 
                          date.getDate() === eventDate.getDate() &&
                          date.getMonth() === eventDate.getMonth() &&
                          date.getFullYear() === eventDate.getFullYear()
                        ) ? 'has-event' : null
                      }
                      className="border-0 shadow-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {loading ? (
                <LoadingSpinner subtle={true} className="py-4" />
              ) : (
                <>
                  <div className="mb-8">
                    <h3 className="text-2xl font-heading font-semibold text-primary-600 mb-6">
                      {selectedDate
                        ? `Events on ${selectedDate instanceof Date ? format(selectedDate, 'dd/MM/yyyy') : ''}`
                        : 'Upcoming Events'}
                    </h3>
                    {futureEvents.length > 0 ? (
                      <div className="space-y-6">
                        {futureEvents.map(event => (
                          <EventCard key={event.id} event={convertEventData(event)} detailed />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-neutral-50 p-6 rounded-lg text-center">
                        <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                        <p className="text-neutral-600">No upcoming events found for the selected filters.</p>
                        <p className="text-sm text-neutral-500 mt-2">Check back soon for new events!</p>
                      </div>
                    )}
                  </div>
                  
                  {pastEventsFiltered.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-heading font-semibold text-primary-600 mb-6">
                        Past Events
                      </h3>
                      <div className="space-y-6">
                        {pastEventsFiltered.map(event => (
                          <EventCard key={event.id} event={convertEventData(event)} detailed />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EventsPage;