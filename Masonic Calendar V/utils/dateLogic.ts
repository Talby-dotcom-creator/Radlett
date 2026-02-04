import { EventType, CalendarEvent } from '../types';

// --- Native Date Helpers ---

const getDayOfWeek = (date: Date) => date.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
const getMonth = (date: Date) => date.getMonth();
const getDate = (date: Date) => date.getDate();

const createDate = (year: number, month: number, day: number) => new Date(year, month, day);

// Get the Nth occurence of a weekday in a specific month
const getNthWeekdayOfMonth = (year: number, month: number, dayOfWeek: number, n: number): Date | null => {
  const date = new Date(year, month, 1);
  
  // Advance to the first occurrence of the dayOfWeek
  while (date.getDay() !== dayOfWeek) {
    date.setDate(date.getDate() + 1);
  }
  
  // Now we are at the 1st occurrence. Add (n-1) weeks.
  date.setDate(date.getDate() + (n - 1) * 7);

  // Check if we spilled over to the next month (e.g., trying to find 5th Saturday in a month with only 4)
  if (date.getMonth() !== month) {
    return null;
  }

  return date;
};

// Find previous Monday relative to a date. 
// offset = 1 means the immediately preceding Monday. 
const getPrecedingMonday = (date: Date, offset: number): Date => {
  const d = new Date(date);
  // Rewind to previous Monday
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() - 1);
  }
  
  // Apply offset. 
  d.setDate(d.getDate() - (offset - 1) * 7);
  return d;
};

// --- Easter & Holiday Logic ---

const getEasterDate = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const generateBankHolidays = (year: number): CalendarEvent[] => {
  const holidays: { date: Date; label: string }[] = [];

  // 1. New Year's Day (Jan 1)
  const jan1 = new Date(year, 0, 1);
  if (jan1.getDay() === 6) { // Sat
    holidays.push({ date: new Date(year, 0, 3), label: "New Year's Day (Sub)" });
  } else if (jan1.getDay() === 0) { // Sun
    holidays.push({ date: new Date(year, 0, 2), label: "New Year's Day (Sub)" });
  } else if (jan1.getDay() === 1) { // Mon
    holidays.push({ date: jan1, label: "New Year's Day" });
  }

  // 2. Easter Related
  const easterSunday = getEasterDate(year);
  const easterMonday = addDays(easterSunday, 1);
  holidays.push({ date: easterMonday, label: "Easter Monday" });

  // 3. Early May (First Monday in May)
  const earlyMay = getNthWeekdayOfMonth(year, 4, 1, 1); 
  if (earlyMay) holidays.push({ date: earlyMay, label: "Early May Bank Holiday" });

  // 4. Spring Bank Holiday (Last Monday in May)
  let springBank = new Date(year, 4, 31);
  while (springBank.getDay() !== 1) {
    springBank.setDate(springBank.getDate() - 1);
  }
  holidays.push({ date: springBank, label: "Spring Bank Holiday" });

  // 5. August Bank Holiday (Last Monday in August)
  let augustBank = new Date(year, 7, 31);
  while (augustBank.getDay() !== 1) {
    augustBank.setDate(augustBank.getDate() - 1);
  }
  holidays.push({ date: augustBank, label: "August Bank Holiday" });

  // 6. Christmas & Boxing Day
  const xmas = new Date(year, 11, 25);
  const boxing = new Date(year, 11, 26);
  
  if (xmas.getDay() === 1) {
    holidays.push({ date: xmas, label: "Christmas Day" });
  }
  if (boxing.getDay() === 1) {
    holidays.push({ date: boxing, label: "Boxing Day" });
  }
  
  if (xmas.getDay() === 5) { // Fri (Boxing on Sat)
     holidays.push({ date: new Date(year, 11, 28), label: "Boxing Day (Sub)" });
  }
  if (xmas.getDay() === 6) { // Sat (Xmas on Sat, Boxing Sun)
     holidays.push({ date: new Date(year, 11, 27), label: "Christmas Day (Sub)" });
  }
  
  return holidays.map(h => ({
    id: `bh-${h.date.getTime()}`,
    date: h.date,
    label: h.label,
    type: EventType.BANK_HOLIDAY,
    isMeeting: false,
    description: "National Bank Holiday"
  }));
};

const generateManualEvents = (year: number): CalendarEvent[] => {
    const d = new Date(year, 0, 1);
    while (d.getDay() !== 1) {
        d.setDate(d.getDate() + 1);
    }

    return [
        {
            id: `manual-loi-agm-${d.getTime()}`,
            date: new Date(d), 
            label: "LoI AGM 8pm",
            type: EventType.MONDAY,
            isMeeting: false,
            time: "20:00",
            description: "Lodge of Instruction Annual General Meeting"
        }
    ];
};

const generateMeetingsAndOfficers = (year: number): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  // Configuration for meetings
  const meetingsConfig = [
    // ALDENHAM (Saturdays)
    { name: "Aldenham Meeting", type: EventType.MEETING_ALDENHAM, officerType: EventType.OFFICERS_ALDENHAM, month: 0, nth: 4, day: 6 }, 
    { name: "Aldenham Meeting", type: EventType.MEETING_ALDENHAM, officerType: EventType.OFFICERS_ALDENHAM, month: 2, nth: 1, day: 6 }, 
    { name: "Aldenham Meeting", type: EventType.MEETING_ALDENHAM, officerType: EventType.OFFICERS_ALDENHAM, month: 4, nth: 2, day: 6 }, 
    { name: "Aldenham Meeting", type: EventType.MEETING_ALDENHAM, officerType: EventType.OFFICERS_ALDENHAM, month: 8, nth: 4, day: 6 }, 
    { name: "Aldenham Meeting", type: EventType.MEETING_ALDENHAM, officerType: EventType.OFFICERS_ALDENHAM, month: 10, nth: 4, day: 6 }, 

    // RADLETT (Saturdays)
    { name: "Radlett Meeting", type: EventType.MEETING_RADLETT, officerType: EventType.OFFICERS_RADLETT, month: 1, nth: 2, day: 6 }, 
    { name: "Radlett Meeting", type: EventType.MEETING_RADLETT, officerType: EventType.OFFICERS_RADLETT, month: 3, nth: 1, day: 6 }, 
    { name: "Radlett Meeting", type: EventType.MEETING_RADLETT, officerType: EventType.OFFICERS_RADLETT, month: 6, nth: 2, day: 6 }, 
    { name: "Radlett Meeting", type: EventType.MEETING_RADLETT, officerType: EventType.OFFICERS_RADLETT, month: 8, nth: 1, day: 6 }, 
    { name: "Radlett Meeting (Installation)", type: EventType.MEETING_RADLETT, officerType: EventType.OFFICERS_RADLETT, month: 11, nth: 2, day: 6 }, 

    // ELSTREE (Thursdays/Wednesday)
    { name: "Elstree Meeting", type: EventType.MEETING_ELSTREE, officerType: EventType.OFFICERS_ELSTREE, month: 2, nth: 3, day: 4 }, 
    { name: "Elstree Meeting", type: EventType.MEETING_ELSTREE, officerType: EventType.OFFICERS_ELSTREE, month: 5, nth: 3, day: 4 }, 
    { name: "Elstree Meeting (Installation)", type: EventType.MEETING_ELSTREE, officerType: EventType.OFFICERS_ELSTREE, month: 9, nth: 3, day: 4 }, 
    { name: "Elstree Meeting", type: EventType.MEETING_ELSTREE, officerType: EventType.OFFICERS_ELSTREE, month: 11, nth: 3, day: 3 }, 
  ];

  meetingsConfig.forEach(cfg => {
    const meetingDate = getNthWeekdayOfMonth(year, cfg.month, cfg.day, cfg.nth);
    
    if (meetingDate) {
      const isInstallation = cfg.name.includes("Installation");
      events.push({
        id: `mtg-${meetingDate.getTime()}`,
        date: meetingDate,
        label: cfg.name,
        type: cfg.type,
        isMeeting: true,
        time: isInstallation ? "16:00" : "16:30",
        description: isInstallation ? "Annual Installation Meeting" : "Regular Lodge Meeting"
      });

      // Calculate Officers Night (Only 1 Monday immediately preceding)
      const off1 = getPrecedingMonday(meetingDate, 1);
      const lodgeName = cfg.name.split(" ")[0];
      const officerLabel = `Officers Night: ${lodgeName}`;

      events.push({
        id: `off1-${meetingDate.getTime()}`,
        date: off1,
        label: officerLabel,
        type: cfg.officerType,
        isMeeting: false,
        time: "19:30",
        description: `Officers Night allocated to the ${lodgeName} meeting. Rehearsal and Lodge of Instruction.`
      });
    }
  });

  return events;
};

// --- Main Generator ---

export const generateCalendarData = (year: number): CalendarEvent[] => {
  const allEvents: CalendarEvent[] = [];
  
  let d = new Date(year, 0, 1);
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() + 1);
  }
  
  while (d.getFullYear() === year) {
    allEvents.push({
      id: `mon-${d.getTime()}`,
      date: new Date(d),
      label: '', 
      type: EventType.MONDAY,
      isMeeting: false
    });
    d.setDate(d.getDate() + 7);
  }

  const specialEvents = [
      ...generateBankHolidays(year), 
      ...generateMeetingsAndOfficers(year),
      ...generateManualEvents(year)
  ];

  const eventMap = new Map<string, CalendarEvent>();
  
  allEvents.forEach(e => eventMap.set(e.date.toDateString(), e));

  specialEvents.forEach(spec => {
    const key = spec.date.toDateString();
    const existing = eventMap.get(key);

    if (existing) {
      let newType = spec.type;
      let newLabel = spec.label;
      let newDescription = spec.description || existing.description;
      let newTime = spec.time || existing.time;

      if (existing.type === EventType.BANK_HOLIDAY) {
         newType = EventType.BANK_HOLIDAY; 
         newLabel = `${existing.label} & ${spec.label}`;
         newDescription = `${existing.description}. ${spec.description}`;
      } else if (existing.type !== EventType.MONDAY) {
         newLabel = `${existing.label} / ${spec.label}`;
         newDescription = `${existing.description} | ${spec.description}`;
      } else if (existing.label) {
         newLabel = `${existing.label} / ${spec.label}`;
         newDescription = `${existing.description} | ${spec.description}`;
      }

      eventMap.set(key, {
        ...existing,
        label: newLabel,
        type: newType,
        description: newDescription,
        time: newTime
      });
    } else {
      eventMap.set(key, spec);
    }
  });

  const sortedEvents = Array.from(eventMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime());

  const degrees = ["1st Degree", "2nd Degree", "3rd Degree"];
  let degreeIndex = 0;

  for (const evt of sortedEvents) {
    const month = evt.date.getMonth();
    const day = evt.date.getDate();
    const isMonday = evt.date.getDay() === 1;

    // August Summer Recess: Aug 3rd to Aug 31st
    // Overwrite any label (including Bank Holidays) to mark as Centre Closed
    if (month === 7 && day >= 3 && day <= 31 && isMonday) {
      evt.label = "Centre Closed";
      evt.description = "The Masonic Centre is closed for the summer recess.";
      evt.type = EventType.RECESS;
      evt.time = undefined;
      evt.isMeeting = false;
      // Skip degree assignment loop for these weeks
      continue;
    }

    if (isMonday && !evt.label) {
      evt.label = degrees[degreeIndex];
      evt.time = "19:30";
      evt.description = "Lodge of Instruction - Practice for " + degrees[degreeIndex];
      degreeIndex = (degreeIndex + 1) % degrees.length;
    }
  }

  return sortedEvents;
};

export const getMonthName = (year: number, monthIndex: number) => {
  const date = new Date(year, monthIndex, 1);
  return date.toLocaleString('default', { month: 'long' });
};

// --- ICS Generator ---

export const generateICS = (events: CalendarEvent[]): string => {
  const formatDate = (date: Date, timeStr?: string) => {
    const [hours, minutes] = timeStr ? timeStr.split(':').map(Number) : [9, 0];
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Masonic Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach(evt => {
    if (!evt.label) return;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${evt.id}@masoniccalendar.com`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    
    const dtStart = formatDate(evt.date, evt.time);
    lines.push(`DTSTART:${dtStart}`);
    
    const endDate = new Date(evt.date);
    const [hours, minutes] = evt.time ? evt.time.split(':').map(Number) : [9, 0];
    endDate.setHours(hours + 2, minutes, 0, 0);
    const dtEnd = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    lines.push(`DTEND:${dtEnd}`);

    lines.push(`SUMMARY:${evt.label}`);
    if (evt.description) {
      lines.push(`DESCRIPTION:${evt.description}`);
    }
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};