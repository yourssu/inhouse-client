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

/**
 * 지원자의 희망 시간대에서 고유한 날짜들을 추출합니다.
 */
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

/**
 * 희망 시간대의 최소/최대 날짜를 계산합니다.
 */
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

/**
 * 이전/다음 주 네비게이션 비활성화 여부를 계산합니다.
 */
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
