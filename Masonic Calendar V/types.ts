export enum EventType {
  MONDAY = 'MONDAY',
  BANK_HOLIDAY = 'BANK_HOLIDAY',
  MEETING_ALDENHAM = 'MEETING_ALDENHAM',
  MEETING_RADLETT = 'MEETING_RADLETT',
  MEETING_ELSTREE = 'MEETING_ELSTREE',
  OFFICERS_ALDENHAM = 'OFFICERS_ALDENHAM',
  OFFICERS_RADLETT = 'OFFICERS_RADLETT',
  OFFICERS_ELSTREE = 'OFFICERS_ELSTREE',
  RECESS = 'RECESS',
}

export interface CalendarEvent {
  id: string;
  date: Date;
  label: string;
  type: EventType;
  isMeeting: boolean; // distinct from just a regular Monday
  time?: string;
  description?: string;
}

export interface MonthData {
  name: string;
  year: number;
  monthIndex: number;
  events: CalendarEvent[];
}