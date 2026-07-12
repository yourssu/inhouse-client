import { isSameDay, parseISO } from 'date-fns';

export interface AvailableTimeRange {
  date: Date;
  endMinutes: number;
  startMinutes: number;
}

export interface ContiguousRange {
  end: number;
  start: number;
}

export const parseAvailableTimes = (isoTimes: string[]): AvailableTimeRange[] => {
  return isoTimes.map((time) => {
    const date = parseISO(time);
    const minutes = date.getHours() * 60 + date.getMinutes();
    return {
      date,
      startMinutes: minutes,
      endMinutes: minutes + 30,
    };
  });
};

export const buildAvailabilityLookup = (ranges: AvailableTimeRange[]): Set<string> => {
  const lookup = new Set<string>();
  for (const range of ranges) {
    const dateKey = range.date.toDateString();
    // 30분 슬롯이므로 시작 시간만 키로 사용
    lookup.add(`${dateKey}|${range.startMinutes}`);
  }
  return lookup;
};

export const checkTimeAvailable = (
  lookup: Set<string>,
  date: Date,
  hour: number,
  minute: number,
): boolean => {
  const dateKey = date.toDateString();
  const checkMinutes = hour * 60 + minute;
  return lookup.has(`${dateKey}|${checkMinutes}`);
};

export const checkCanStartDrag = (
  ranges: AvailableTimeRange[],
  date: Date,
  minutes: number,
): boolean => {
  return ranges.some(
    (range) =>
      isSameDay(range.date, date) && minutes >= range.startMinutes && minutes <= range.endMinutes,
  );
};

export const buildContiguousRanges = (
  ranges: AvailableTimeRange[],
): Map<string, ContiguousRange[]> => {
  // 날짜별로 그룹화
  const byDate = new Map<string, AvailableTimeRange[]>();
  for (const range of ranges) {
    const dateKey = range.date.toDateString();
    const group = byDate.get(dateKey);
    if (group) {
      group.push(range);
    } else {
      byDate.set(dateKey, [range]);
    }
  }

  // 각 날짜별로 정렬 후 병합
  const result = new Map<string, ContiguousRange[]>();
  for (const [dateKey, dayRanges] of byDate) {
    dayRanges.sort((a, b) => a.startMinutes - b.startMinutes);

    const merged: ContiguousRange[] = [];
    let current = { start: dayRanges[0].startMinutes, end: dayRanges[0].endMinutes };

    for (let i = 1; i < dayRanges.length; i++) {
      if (dayRanges[i].startMinutes <= current.end) {
        current.end = Math.max(current.end, dayRanges[i].endMinutes);
      } else {
        merged.push(current);
        current = { start: dayRanges[i].startMinutes, end: dayRanges[i].endMinutes };
      }
    }
    merged.push(current);
    result.set(dateKey, merged);
  }

  return result;
};

export const findContiguousRange = (
  contiguousRanges: Map<string, ContiguousRange[]>,
  date: Date,
  minutes: number,
): ContiguousRange | undefined => {
  const dateKey = date.toDateString();
  const ranges = contiguousRanges.get(dateKey);
  if (!ranges) {
    return undefined;
  }
  return ranges.find((range) => minutes >= range.start && minutes <= range.end);
};
