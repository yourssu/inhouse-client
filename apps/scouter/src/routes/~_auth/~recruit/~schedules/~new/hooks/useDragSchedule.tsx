import { useSuspenseQuery } from '@tanstack/react-query';
import { addMinutes, isSameDay, setHours, setMinutes, startOfDay } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ApplicantType } from '@/apis/applicants/schema';

import { partsOption } from '@/apis/parts/query';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { LocationInputDialogContent } from '@/routes/~_auth/~recruit/~schedules/~new/components/LocationInputDialogContent';
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
  const { selectedPartId, addDraftSchedule } = useScheduleCreationContext();

  const openAlertDialog = useAlertDialog();

  const { data: parts } = useSuspenseQuery(partsOption());
  const selectedPartName = useMemo(
    () => parts.find((part) => part.partId === selectedPartId)?.partName,
    [parts, selectedPartId],
  );

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<DragPosition | null>(null);
  const [dragCurrent, setDragCurrent] = useState<DragPosition | null>(null);

  // 연속 범위를 사전 계산 (activeApplicant 변경 시에만 재계산)
  const contiguousRanges = useMemo(
    () => buildContiguousRanges(availableTimeRanges),
    [availableTimeRanges],
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

  const handleMouseUp = useCallback(async () => {
    if (
      !isDragging ||
      !dragStart ||
      !dragCurrent ||
      !activeApplicant ||
      !selectedPartId ||
      !selectedPartName
    ) {
      setIsDragging(false);
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    const startMinutes = Math.min(dragStart.minutes, dragCurrent.minutes);
    const endMinutes = Math.max(dragStart.minutes, dragCurrent.minutes);
    const dragDate = dragStart.date;

    // 드래그 상태를 먼저 초기화해 미리보기를 즉시 제거한다.
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);

    if (endMinutes - startMinutes < 30) {
      return;
    }

    const startTime = addMinutes(setMinutes(setHours(startOfDay(dragDate), 0), 0), startMinutes);
    const endTime = addMinutes(setMinutes(setHours(startOfDay(dragDate), 0), 0), endMinutes);

    const confirmed = await openAlertDialog({
      title: '면접 장소 선택',
      content: ({ closeAsTrue, closeAsFalse }) => (
        <LocationInputDialogContent
          applicantName={activeApplicant.name}
          closeAsFalse={closeAsFalse}
          closeAsTrue={closeAsTrue}
          endTime={endTime}
          onSubmit={({ locationDetail, locationType }) => {
            addDraftSchedule({
              applicantId: activeApplicant.applicantId,
              applicantName: activeApplicant.name,
              partId: selectedPartId,
              startTime,
              endTime,
              locationType,
              locationDetail,
            });
          }}
          selectedPartName={selectedPartName}
          startTime={startTime}
        />
      ),
      customized: true,
    });

    if (!confirmed) {
      return;
    }
  }, [
    isDragging,
    dragStart,
    dragCurrent,
    activeApplicant,
    selectedPartId,
    selectedPartName,
    addDraftSchedule,
    openAlertDialog,
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
