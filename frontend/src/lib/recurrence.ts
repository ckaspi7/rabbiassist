import { RRule, RRuleSet, rrulestr } from 'rrule';

export interface RecurrenceOverride {
  title?: string;
  description?: string;
  event_datetime?: string;
  end_datetime?: string;
  all_day?: boolean;
  timezone?: string;
  location?: string;
  deleted?: boolean;
}

export interface RecurrenceOverrides {
  [occurrenceStartIso: string]: RecurrenceOverride;
}

export interface ExpandedOccurrence {
  occurrence_id: string; // series_id + occurrence_start_iso
  series_id: string;
  occurrence_start: string; // ISO string
  occurrence_end: string | null;
  title: string | null;
  description: string | null;
  location: string | null;
  timezone: string | null;
  all_day: boolean;
  type: string;
  is_override: boolean;
  is_recurring: boolean;
  google_event_id?: string | null;
  sync_status?: string;
  recurrence_rule?: string | null;
}

export interface MasterEvent {
  id: string;
  title: string | null;
  event_datetime: string;
  end_datetime?: string | null;
  location?: string | null;
  description?: string | null;
  type: string;
  user_id: string;
  recurrence_rule?: string | null;
  recurrence_exceptions?: string[] | null;
  recurrence_overrides?: RecurrenceOverrides | null;
  all_day?: boolean | null;
  timezone?: string | null;
  google_event_id?: string | null;
  sync_status?: string;
}

/**
 * Parse an RRULE string into an RRule object
 */
export function parseRRule(rruleString: string, dtstart: Date): RRule | null {
  try {
    // Handle simple FREQ= rules
    if (rruleString.startsWith('FREQ=') && !rruleString.includes('DTSTART')) {
      return new RRule({
        ...RRule.parseString(rruleString),
        dtstart,
      });
    }
    
    // Handle full RRULE strings
    const rule = rrulestr(rruleString, { dtstart });
    return rule instanceof RRule ? rule : null;
  } catch (error) {
    console.error('Failed to parse RRULE:', rruleString, error);
    return null;
  }
}

/**
 * Expand recurring events into individual occurrences within a date range
 */
export function expandRecurringEvents(
  events: MasterEvent[],
  rangeStart: Date,
  rangeEnd: Date
): ExpandedOccurrence[] {
  const occurrences: ExpandedOccurrence[] = [];

  for (const event of events) {
    if (event.recurrence_rule) {
      // Recurring event - expand occurrences
      const expanded = expandSingleRecurringEvent(event, rangeStart, rangeEnd);
      occurrences.push(...expanded);
    } else {
      // Single event - check if it falls within range
      const eventStart = new Date(event.event_datetime);
      if (eventStart >= rangeStart && eventStart <= rangeEnd) {
        occurrences.push({
          occurrence_id: event.id,
          series_id: event.id,
          occurrence_start: event.event_datetime,
          occurrence_end: event.end_datetime || null,
          title: event.title,
          description: event.description || null,
          location: event.location || null,
          timezone: event.timezone || null,
          all_day: event.all_day || false,
          type: event.type,
          is_override: false,
          is_recurring: false,
          google_event_id: event.google_event_id,
          sync_status: event.sync_status,
        });
      }
    }
  }

  // Sort by occurrence start time
  return occurrences.sort(
    (a, b) => new Date(a.occurrence_start).getTime() - new Date(b.occurrence_start).getTime()
  );
}

/**
 * Expand a single recurring event into occurrences
 */
function expandSingleRecurringEvent(
  event: MasterEvent,
  rangeStart: Date,
  rangeEnd: Date
): ExpandedOccurrence[] {
  const occurrences: ExpandedOccurrence[] = [];
  const dtstart = new Date(event.event_datetime);
  
  const rule = parseRRule(event.recurrence_rule!, dtstart);
  if (!rule) return occurrences;

  // Create RRuleSet to handle exceptions
  const ruleSet = new RRuleSet();
  ruleSet.rrule(rule);

  // Add exceptions (excluded dates)
  const exceptions = event.recurrence_exceptions || [];
  for (const exDateStr of exceptions) {
    try {
      const exDate = new Date(exDateStr);
      ruleSet.exdate(exDate);
    } catch (e) {
      console.warn('Invalid exception date:', exDateStr);
    }
  }

  // Get all occurrences in range (with a reasonable limit)
  const dates = ruleSet.between(rangeStart, rangeEnd, true);
  const overrides = (event.recurrence_overrides || {}) as RecurrenceOverrides;

  // Calculate duration for end_datetime
  const duration = event.end_datetime
    ? new Date(event.end_datetime).getTime() - dtstart.getTime()
    : 0;

  for (const occDate of dates) {
    const occurrenceStartIso = occDate.toISOString();
    const override = overrides[occurrenceStartIso];

    // Skip if this occurrence is marked as deleted
    if (override?.deleted) continue;

    // Calculate occurrence end time
    const occurrenceEnd = duration > 0
      ? new Date(occDate.getTime() + duration).toISOString()
      : null;

    // Apply overrides if present
    const occurrence: ExpandedOccurrence = {
      occurrence_id: `${event.id}_${occurrenceStartIso}`,
      series_id: event.id,
      occurrence_start: override?.event_datetime || occurrenceStartIso,
      occurrence_end: override?.end_datetime || occurrenceEnd,
      title: override?.title ?? event.title,
      description: override?.description ?? event.description ?? null,
      location: override?.location ?? event.location ?? null,
      timezone: override?.timezone ?? event.timezone ?? null,
      all_day: override?.all_day ?? event.all_day ?? false,
      type: event.type,
      is_override: !!override,
      is_recurring: true,
      google_event_id: event.google_event_id,
      sync_status: event.sync_status,
      recurrence_rule: event.recurrence_rule,
    };

    occurrences.push(occurrence);
  }

  return occurrences;
}

/**
 * Get the occurrence key (ISO string) for a date
 */
export function getOccurrenceKey(date: Date): string {
  return date.toISOString();
}

/**
 * Check if an occurrence ID represents a recurring instance
 */
export function isRecurringOccurrence(occurrenceId: string): boolean {
  return occurrenceId.includes('_');
}

/**
 * Parse occurrence ID to get series ID and occurrence start
 */
export function parseOccurrenceId(occurrenceId: string): { seriesId: string; occurrenceStart: string | null } {
  if (!occurrenceId.includes('_')) {
    return { seriesId: occurrenceId, occurrenceStart: null };
  }
  
  const underscoreIndex = occurrenceId.indexOf('_');
  return {
    seriesId: occurrenceId.substring(0, underscoreIndex),
    occurrenceStart: occurrenceId.substring(underscoreIndex + 1),
  };
}

/**
 * Validate recurrence rule format
 */
export function validateRecurrenceRule(rule: string): boolean {
  try {
    const testDate = new Date();
    parseRRule(rule, testDate);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get human-readable recurrence description
 */
export function getRecurrenceDescription(rule: string): string {
  try {
    const testDate = new Date();
    const rrule = parseRRule(rule, testDate);
    if (rrule) {
      return rrule.toText();
    }
    return rule;
  } catch {
    return rule;
  }
}
