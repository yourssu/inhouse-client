import { useSuspenseQuery } from '@tanstack/react-query';
import { assert } from 'es-toolkit';
import { createContext, type PropsWithChildren, useCallback, useContext, useState } from 'react';

import type { DraftScheduleType } from '@/types/schedule';

import { semestersNowOption } from '@/apis/semesters/query';

interface ScheduleCreationContextState {
  activeApplicantId: null | number;
  draftSchedules: DraftScheduleType[];
  isCreatingSchedule: boolean;
  selectedApplicantIds: number[];
  selectedPartId: null | number;
  selectedSemester: null | string;
  selectedSemesterId: null | number;
}

interface ScheduleCreationContextActions {
  addDraftSchedule: (schedule: DraftScheduleType) => void;
  clearDraftSchedules: () => void;
  enterCreationMode: () => void;
  exitCreationMode: () => void;
  removeDraftSchedule: (applicantId: number) => void;
  selectPart: (partId: null | number) => void;
  selectSemester: (semesterId: null | number, semester: null | string) => void;
  setActiveApplicant: (applicantId: null | number) => void;
  toggleApplicant: (applicantId: number) => void;
}

type ScheduleCreationContextType = ScheduleCreationContextActions & ScheduleCreationContextState;

const ScheduleCreationContext = createContext<ScheduleCreationContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useScheduleCreationContext = () => {
  const context = useContext(ScheduleCreationContext);
  assert(
    !!context,
    'useScheduleCreationContext는 ScheduleCreationProvider 하위에서만 사용할 수 있어요.',
  );
  return context;
};

const initialState: ScheduleCreationContextState = {
  isCreatingSchedule: false,
  selectedPartId: null,
  selectedSemester: null,
  selectedSemesterId: null,
  selectedApplicantIds: [],
  activeApplicantId: null,
  draftSchedules: [],
};

export const ScheduleCreationProvider = ({ children }: PropsWithChildren) => {
  const { data: semester } = useSuspenseQuery(semestersNowOption());
  const [state, setState] = useState<ScheduleCreationContextState>({
    ...initialState,
    selectedSemesterId: semester.semesterId,
    selectedSemester: semester.semester,
  });

  const enterCreationMode = useCallback(() => {
    setState((prev) => ({ ...prev, isCreatingSchedule: true }));
  }, []);

  const exitCreationMode = useCallback(() => {
    setState({
      ...initialState,
      selectedSemesterId: semester.semesterId,
      selectedSemester: semester.semester,
    });
  }, [semester]);

  const selectPart = useCallback((partId: null | number) => {
    setState((prev) => ({
      ...prev,
      selectedPartId: partId,
      selectedApplicantIds: [],
      activeApplicantId: null,
      draftSchedules: [],
    }));
  }, []);

  const selectSemester = useCallback((semesterId: null | number, semester: null | string) => {
    setState((prev) => ({
      ...prev,
      selectedSemesterId: semesterId,
      selectedSemester: semester,
      selectedApplicantIds: [],
      activeApplicantId: null,
      draftSchedules: [],
    }));
  }, []);

  const toggleApplicant = useCallback((applicantId: number) => {
    setState((prev) => {
      const isSelected = prev.selectedApplicantIds.includes(applicantId);
      const newSelectedIds = isSelected
        ? prev.selectedApplicantIds.filter((id) => id !== applicantId)
        : [...prev.selectedApplicantIds, applicantId];

      // 선택 해제 시 해당 지원자의 draft 일정도 제거
      const newDraftSchedules = isSelected
        ? prev.draftSchedules.filter((s) => s.applicantId !== applicantId)
        : prev.draftSchedules;

      // 선택 해제 시 active가 해제된 지원자면 active도 해제
      const newActiveId =
        isSelected && prev.activeApplicantId === applicantId ? null : prev.activeApplicantId;

      return {
        ...prev,
        selectedApplicantIds: newSelectedIds,
        draftSchedules: newDraftSchedules,
        activeApplicantId: newActiveId,
      };
    });
  }, []);

  const setActiveApplicant = useCallback((applicantId: null | number) => {
    setState((prev) => ({ ...prev, activeApplicantId: applicantId }));
  }, []);

  const addDraftSchedule = useCallback((schedule: DraftScheduleType) => {
    setState((prev) => {
      // 같은 지원자의 기존 일정 제거 후 새 일정 추가
      const filteredSchedules = prev.draftSchedules.filter(
        (s) => s.applicantId !== schedule.applicantId,
      );
      return {
        ...prev,
        draftSchedules: [...filteredSchedules, schedule],
      };
    });
  }, []);

  const removeDraftSchedule = useCallback((applicantId: number) => {
    setState((prev) => ({
      ...prev,
      draftSchedules: prev.draftSchedules.filter((s) => s.applicantId !== applicantId),
    }));
  }, []);

  const clearDraftSchedules = useCallback(() => {
    setState((prev) => ({ ...prev, draftSchedules: [] }));
  }, []);

  const value: ScheduleCreationContextType = {
    ...state,
    enterCreationMode,
    exitCreationMode,
    selectPart,
    selectSemester,
    toggleApplicant,
    setActiveApplicant,
    addDraftSchedule,
    removeDraftSchedule,
    clearDraftSchedules,
  };

  return (
    <ScheduleCreationContext.Provider value={value}>{children}</ScheduleCreationContext.Provider>
  );
};
