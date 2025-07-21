/**
 * Lodge Meeting Schedule Calculator
 * Calculates the next meeting date based on Radlett Lodge No. 6652's schedule:
 * - 2nd Saturday December (Installation)
 * - 2nd Saturday February 
 * - 1st Saturday April
 * - 2nd Saturday July
 * - 1st Saturday September
 */

export interface LodgeMeeting {
  date: Date;
  title: string;
  description: string;
  location: string;
  isInstallation: boolean;
}

/**
 * Get the nth occurrence of a weekday in a month
 * @param year - The year
 * @param month - The month (0-11)
 * @param weekday - The weekday (0=Sunday, 6=Saturday)
 * @param occurrence - Which occurrence (1st, 2nd, etc.)
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, occurrence: number): Date {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  
  // Calculate the date of the first occurrence of the weekday
  let firstOccurrence = 1 + (weekday - firstWeekday + 7) % 7;
  
  // Add weeks to get the nth occurrence
  const targetDate = firstOccurrence + (occurrence - 1) * 7;
  
  return new Date(year, month, targetDate);
}

/**
 * Get all Lodge meetings for a given year
 */
export function getLodgeMeetingsForYear(year: number): LodgeMeeting[] {
  const meetings: LodgeMeeting[] = [];
  const location = "Radlett Masonic Centre, Rose Walk, Radlett";
  
  // February - 2nd Saturday
  const february = getNthWeekdayOfMonth(year, 1, 6, 2); // Month 1 = February, 6 = Saturday
  meetings.push({
    date: new Date(february.getFullYear(), february.getMonth(), february.getDate(), 18, 0), // 6:00 PM
    title: "Regular Lodge Meeting",
    description: "February regular meeting of Radlett Lodge No. 6652. Festive Board to follow.",
    location,
    isInstallation: false
  });
  
  // April - 1st Saturday
  const april = getNthWeekdayOfMonth(year, 3, 6, 1); // Month 3 = April
  meetings.push({
    date: new Date(april.getFullYear(), april.getMonth(), april.getDate(), 18, 0),
    title: "Regular Lodge Meeting",
    description: "April regular meeting of Radlett Lodge No. 6652. Festive Board to follow.",
    location,
    isInstallation: false
  });
  
  // July - 2nd Saturday
  const july = getNthWeekdayOfMonth(year, 6, 6, 2); // Month 6 = July
  meetings.push({
    date: new Date(july.getFullYear(), july.getMonth(), july.getDate(), 18, 0),
    title: "Regular Lodge Meeting",
    description: "July regular meeting of Radlett Lodge No. 6652. Festive Board to follow.",
    location,
    isInstallation: false
  });
  
  // September - 1st Saturday
  const september = getNthWeekdayOfMonth(year, 8, 6, 1); // Month 8 = September
  meetings.push({
    date: new Date(september.getFullYear(), september.getMonth(), september.getDate(), 18, 0),
    title: "Regular Lodge Meeting",
    description: "September regular meeting of Radlett Lodge No. 6652. Festive Board to follow.",
    location,
    isInstallation: false
  });
  
  // December - 2nd Saturday (Installation)
  const december = getNthWeekdayOfMonth(year, 11, 6, 2); // Month 11 = December
  meetings.push({
    date: new Date(december.getFullYear(), december.getMonth(), december.getDate(), 18, 0),
    title: "Installation Meeting",
    description: "Annual Installation of the Worshipful Master and Officers. Festive Board to follow.",
    location,
    isInstallation: true
  });
  
  return meetings.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Get the next upcoming Lodge meeting
 */
export function getNextLodgeMeeting(): LodgeMeeting | null {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Get meetings for current year and next year
  const currentYearMeetings = getLodgeMeetingsForYear(currentYear);
  const nextYearMeetings = getLodgeMeetingsForYear(currentYear + 1);
  
  const allMeetings = [...currentYearMeetings, ...nextYearMeetings];
  
  // Find the next meeting after now
  const nextMeeting = allMeetings.find(meeting => meeting.date > now);
  
  return nextMeeting || null;
}

/**
 * Get all upcoming Lodge meetings (next 3)
 */
export function getUpcomingLodgeMeetings(count: number = 3): LodgeMeeting[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Get meetings for current year and next year
  const currentYearMeetings = getLodgeMeetingsForYear(currentYear);
  const nextYearMeetings = getLodgeMeetingsForYear(currentYear + 1);
  
  const allMeetings = [...currentYearMeetings, ...nextYearMeetings];
  
  // Filter future meetings and take the requested count
  return allMeetings
    .filter(meeting => meeting.date > now)
    .slice(0, count);
}

/**
 * Check if a date is a Lodge meeting day
 */
export function isLodgeMeetingDay(date: Date): boolean {
  const year = date.getFullYear();
  const meetings = getLodgeMeetingsForYear(year);
  
  return meetings.some(meeting => 
    meeting.date.getFullYear() === date.getFullYear() &&
    meeting.date.getMonth() === date.getMonth() &&
    meeting.date.getDate() === date.getDate()
  );
}