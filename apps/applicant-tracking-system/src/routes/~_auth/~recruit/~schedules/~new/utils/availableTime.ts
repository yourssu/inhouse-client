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

/**
 * ISO datetime 배열을 AvailableTimeRange 배열로 파싱합니다.
 * 각 시간대는 30분 슬롯으로 간주됩니다.
 */
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

/**
 * O(1) 시간 가용성 확인을 위한 lookup Set을 생성합니다.
 * key: "YYYY-MM-DD|HH:MM" 형태
 */
export const buildAvailabilityLookup = (ranges: AvailableTimeRange[]): Set<string> => {
  const lookup = new Set<string>();
  for (const range of ranges) {
    const dateKey = range.date.toDateString();
    // 30분 슬롯이므로 시작 시간만 키로 사용
    lookup.add(`${dateKey}|${range.startMinutes}`);
  }
  return lookup;
};

/**
 * lookup Set을 사용하여 O(1)로 시간 가용성을 확인합니다.
 */
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

/**
 * 드래그 시작 가능 여부를 확인합니다 (끝시간 포함).
 */
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

/**
 * 연속된 희망 시간대 범위를 미리 계산합니다.
 * 날짜별로 병합된 범위를 Map으로 반환합니다.
 *
 * 이전: getContiguousAvailableRange()에서 매번 filter + sort + 병합 → O(n log n) per call
 * 이후: 한 번 계산 후 Map lookup → O(1) per call (범위 수가 적으므로 선형 탐색도 사실상 O(1))
 */
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

/**
 * 특정 날짜/분을 포함하는 연속 범위를 찾습니다.
 */
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
