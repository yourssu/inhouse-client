import {
  addWeeks,
  endOfWeek,
  isAfter,
  isBefore,
  max,
  min,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns';

import type { ApplicantType } from '@/apis/applicants/schema';

export const extractUniqueDates = (applicant: ApplicantType): Date[] => {
  const uniqueDates = new Map<string, Date>();
  for (const time of applicant.availableTimes) {
    const date = parseISO(time);
    const dateKey = date.toDateString();
    if (!uniqueDates.has(dateKey)) {
      uniqueDates.set(dateKey, date);
    }
  }
  return Array.from(uniqueDates.values());
};

export const getDateBounds = (
  applicant: ApplicantType | undefined,
): { maxDate: Date | null; minDate: Date | null } => {
  if (!applicant || applicant.availableTimes.length === 0) {
    return { minDate: null, maxDate: null };
  }

  const dates = applicant.availableTimes.map((time) => parseISO(time));
  return {
    minDate: min(dates),
    maxDate: max(dates),
  };
};

export const getNavigationDisabled = (
  viewMode: '전체' | '희망',
  displayDate: Date,
  minDate: Date | null,
  maxDate: Date | null,
): { disableNext: boolean; disablePrevious: boolean } => {
  if (viewMode !== '희망') {
    return { disablePrevious: false, disableNext: false };
  }

  const disablePrevious = minDate ? isBefore(endOfWeek(subWeeks(displayDate, 1)), minDate) : false;

  const disableNext = maxDate ? isAfter(startOfWeek(addWeeks(displayDate, 1)), maxDate) : false;

  return { disablePrevious, disableNext };
};
