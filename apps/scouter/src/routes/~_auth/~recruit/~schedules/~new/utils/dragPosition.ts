import {
  hourHeight,
  startHour,
} from '@/routes/~_auth/~recruit/~schedules/components/WeeklyCalendarLayout/type';

/**
 * 마우스 Y 좌표에서 원시 분 값을 계산합니다 (스냅 없음).
 */
export const getRawMinutesFromPosition = (clientY: number, columnElement: HTMLElement): number => {
  const rect = columnElement.getBoundingClientRect();
  const relativeY = clientY - rect.top;
  return (relativeY / hourHeight) * 60 + startHour * 60;
};

/**
 * 마우스 Y 좌표에서 30분 간격으로 스냅된 분 값을 계산합니다.
 */
export const getSnappedMinutesFromPosition = (
  clientY: number,
  columnElement: HTMLElement,
): number => {
  const rawMinutes = getRawMinutesFromPosition(clientY, columnElement);
  return Math.round(rawMinutes / 30) * 30;
};

/**
 * 드래그 시작 분 값을 계산합니다.
 * 블록의 상단/하단 절반 중 어느 쪽을 클릭했는지에 따라 결정됩니다.
 */
export const getDragStartMinutes = (clientY: number, columnElement: HTMLElement): number => {
  const rawMinutes = getRawMinutesFromPosition(clientY, columnElement);
  const blockStart = Math.floor(rawMinutes / 30) * 30;
  const positionInBlock = rawMinutes - blockStart;

  // 블록의 절반(15분)을 기준으로 위/아래 결정
  return positionInBlock < 15 ? blockStart : blockStart + 30;
};

/**
 * 분 값에서 픽셀 top 위치를 계산합니다.
 */
export const minutesToPixelTop = (minutes: number): number => {
  return ((minutes - startHour * 60) / 60) * hourHeight;
};

/**
 * 분 차이에서 픽셀 높이를 계산합니다.
 */
export const minutesToPixelHeight = (durationMinutes: number): number => {
  return (durationMinutes / 60) * hourHeight;
};
