import {
  addMinutes,
  areIntervalsOverlapping,
  isSameDay,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { DraftScheduleType } from '@/types/schedule';

import { useScheduleCreationContext } from '@/routes/~_auth/~recruit/~schedules/~new/context';
import {
  type AvailableTimeRange,
  buildContiguousRanges,
  checkCanStartDrag,
  findContiguousRange,
  parseAvailableTimes,
} from '@/routes/~_auth/~recruit/~schedules/~new/utils/availableTime';
import {
  getDragStartMinutes,
  getSnappedMinutesFromPosition,
} from '@/routes/~_auth/~recruit/~schedules/~new/utils/dragPosition';

interface DragPosition {
  date: Date;
  minutes: number;
}

interface UseDragScheduleReturn {
  dragCurrent: DragPosition | null;
  dragStart: DragPosition | null;
  handleMouseDown: (e: React.MouseEvent, date: Date) => void;
  handleMouseMove: (e: React.MouseEvent, date: Date) => void;
  handleMouseUp: () => void;
  isDragging: boolean;
}

export const useDragSchedule = (
  activeApplicant: ApplicantType | undefined,
  availableTimeRanges: AvailableTimeRange[],
): UseDragScheduleReturn => {
  const { selectedPartId, draftSchedules, activeApplicantId, addDraftSchedule } =
    useScheduleCreationContext();

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DragPosition | null>(null);
  const [dragCurrent, setDragCurrent] = useState<DragPosition | null>(null);

  // 연속 범위를 사전 계산 (activeApplicant 변경 시에만 재계산)
  const contiguousRanges = useMemo(
    () => buildContiguousRanges(availableTimeRanges),
    [availableTimeRanges],
  );

  const getOverlappingSchedules = useCallback(
    (date: Date, startMinutes: number, endMinutes: number): DraftScheduleType[] => {
      const startTime = addMinutes(setMinutes(setHours(startOfDay(date), 0), 0), startMinutes);
      const endTime = addMinutes(setMinutes(setHours(startOfDay(date), 0), 0), endMinutes);

      return draftSchedules.filter(
        (schedule) =>
          schedule.applicantId !== activeApplicantId &&
          isSameDay(schedule.startTime, date) &&
          areIntervalsOverlapping(
            { start: startTime, end: endTime },
            { start: schedule.startTime, end: schedule.endTime },
          ),
      );
    },
    [draftSchedules, activeApplicantId],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, date: Date) => {
      if (!activeApplicant) {
        return;
      }

      const target = e.currentTarget as HTMLElement;
      const dragStartMs = getDragStartMinutes(e.clientY, target);

      if (!checkCanStartDrag(availableTimeRanges, date, dragStartMs)) {
        return;
      }

      setIsDragging(true);
      setDragStart({ date, minutes: dragStartMs });
      setDragCurrent({ date, minutes: dragStartMs });
    },
    [activeApplicant, availableTimeRanges],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, date: Date) => {
      if (!isDragging || !dragStart || !isSameDay(dragStart.date, date)) {
        return;
      }

      const target = e.currentTarget as HTMLElement;
      let minutes = getSnappedMinutesFromPosition(e.clientY, target);

      // 연속 범위 내로 제한 — O(1) lookup
      const contiguousRange = findContiguousRange(contiguousRanges, date, dragStart.minutes);
      if (contiguousRange) {
        minutes = Math.max(contiguousRange.start, Math.min(contiguousRange.end, minutes));
      }

      setDragCurrent({ date, minutes });
    },
    [isDragging, dragStart, contiguousRanges],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !dragStart || !dragCurrent || !activeApplicant || !selectedPartId) {
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    const startMinutes = Math.min(dragStart.minutes, dragCurrent.minutes);
    const endMinutes = Math.max(dragStart.minutes, dragCurrent.minutes);

    if (endMinutes - startMinutes >= 30) {
      const startTime = addMinutes(
        setMinutes(setHours(startOfDay(dragStart.date), 0), 0),
        startMinutes,
      );
      const endTime = addMinutes(
        setMinutes(setHours(startOfDay(dragStart.date), 0), 0),
        endMinutes,
      );

      const overlaps = getOverlappingSchedules(dragStart.date, startMinutes, endMinutes);
      if (overlaps.length === 0) {
        addDraftSchedule({
          applicantId: activeApplicant.applicantId,
          applicantName: activeApplicant.name,
          partId: selectedPartId,
          startTime,
          endTime,
        });
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  }, [
    isDragging,
    dragStart,
    dragCurrent,
    activeApplicant,
    selectedPartId,
    getOverlappingSchedules,
    addDraftSchedule,
  ]);

  // 글로벌 mouseup 이벤트 처리
  useEffect(() => {
    if (!isDragging) {
      return;
    }

    const handleGlobalMouseUp = () => handleMouseUp();
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, handleMouseUp]);

  return {
    isDragging,
    dragStart,
    dragCurrent,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};

export const useAvailableTimeRanges = (activeApplicant: ApplicantType | undefined) => {
  return useMemo(() => {
    if (!activeApplicant) {
      return [];
    }
    return parseAvailableTimes(activeApplicant.availableTimes);
  }, [activeApplicant]);
};
