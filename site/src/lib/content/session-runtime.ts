import { buildSessionCalendarDocument } from "../domain/session-calendar.js";
import {
  buildSessionEventSchema,
  formatNextOccurrenceLabel,
  formatTimeRangeFromDuration,
  getEndTimeValue,
  getNextWeeklyOccurrence,
  getSessionTemporalState
} from "../domain/session-schedule.js";

export interface SessionRuntimeInput {
  title: string;
  shortTitle: string;
  route: string;
  eventDescription: string;
  schedule: {
    type: string;
    label?: string;
    byDay?: string[];
    intervalWeeks?: number;
    startLocalDate?: string | null;
    weekday?: string;
    weekdayIndex?: number;
    startTime: string;
    endTime?: string;
    durationMinutes: number;
    timezone: string;
    recurrenceRule?: string;
    status?: {
      state: string;
      note: string | null;
      resumeDate: string | null;
      seasonStartDate: string | null;
      seasonEndDate: string | null;
    };
  };
  calendar?: {
    publicPath: string;
    uid: string;
    status: string;
  };
  location: {
    locality: string;
    venueName?: string | null;
    venueAddress?: string | null;
    disclosurePolicy?: string;
  };
}

export function getNextOccurrence(
  session: SessionRuntimeInput,
  now = new Date()
): { start: Date; end: Date } | null {
  return getNextWeeklyOccurrence(session, now);
}

export function getTemporalState(session: SessionRuntimeInput, now = new Date()) {
  return getSessionTemporalState(session, now);
}

export function buildEventSchema(
  session: SessionRuntimeInput,
  options: {
    siteUrl: string;
    organizationName: string;
    imageUrl: string;
  },
  now = new Date()
): Record<string, unknown> | null {
  return buildSessionEventSchema(session, options, now);
}

export function buildCalendarDocument(
  session: SessionRuntimeInput,
  options: {
    generatedAt?: Date;
    productId?: string;
    siteUrl?: string;
  } = {}
) {
  return buildSessionCalendarDocument(session, {
    generatedAt: options.generatedAt ?? new Date(),
    productId: options.productId ?? "-//EncouragingYou//Sessions//EN",
    siteUrl: options.siteUrl ?? ""
  });
}

export function getNextOccurrenceLabel(
  session: SessionRuntimeInput,
  now = new Date()
): string | null {
  return formatNextOccurrenceLabel(session, now);
}

export function getTimeRangeLabel(session: SessionRuntimeInput) {
  return formatTimeRangeFromDuration(
    session.schedule.startTime,
    session.schedule.durationMinutes
  );
}

export function getEndTimeLabel(session: SessionRuntimeInput) {
  return getEndTimeValue(session.schedule.startTime, session.schedule.durationMinutes);
}
