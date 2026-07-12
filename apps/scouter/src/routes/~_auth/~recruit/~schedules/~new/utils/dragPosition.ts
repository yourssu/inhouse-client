import {
  hourHeight,
  startHour,
} from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendarLayout/type';

export const getRawMinutesFromPosition = (clientY: number, columnElement: HTMLElement): number => {
  const rect = columnElement.getBoundingClientRect();
  const relativeY = clientY - rect.top;
  return (relativeY / hourHeight) * 60 + startHour * 60;
};

export const getSnappedMinutesFromPosition = (
  clientY: number,
  columnElement: HTMLElement,
): number => {
  const rawMinutes = getRawMinutesFromPosition(clientY, columnElement);
  return Math.round(rawMinutes / 30) * 30;
};

export const getDragStartMinutes = (clientY: number, columnElement: HTMLElement): number => {
  const rawMinutes = getRawMinutesFromPosition(clientY, columnElement);
  const blockStart = Math.floor(rawMinutes / 30) * 30;
  const positionInBlock = rawMinutes - blockStart;

  // 블록의 절반(15분)을 기준으로 위/아래 결정
  return positionInBlock < 15 ? blockStart : blockStart + 30;
};

export const minutesToPixelTop = (minutes: number): number => {
  return ((minutes - startHour * 60) / 60) * hourHeight;
};

export const minutesToPixelHeight = (durationMinutes: number): number => {
  return (durationMinutes / 60) * hourHeight;
};
