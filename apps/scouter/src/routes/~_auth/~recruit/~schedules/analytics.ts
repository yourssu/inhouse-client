/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

import type { PartNameType } from '@/apis/parts/schema';
import type { LocationType } from '@/apis/schedule/schema';

type NoEventProperties = Record<never, never>;

type ScheduleTargetProperties = {
  part: PartNameType;
  part_id: number;
  selected_semester: string;
};

export const scheduleCalendarView = {
  월별: 'month',
  주별: 'week',
} as const;

export const scheduleAvailabilityFilter = {
  전체: 'all',
  희망: 'preferred',
} as const;

export interface ScheduleAnalyticsEventProperties {
  /** 면접 일정 자동 생성 버튼을 클릭했을 때 발생해요. */
  schedule_auto_generate_click: NoEventProperties;
  /** 일정 생성 화면의 전체 또는 희망 시간 필터가 실제로 변경됐을 때 발생해요. */
  schedule_availability_filter_selected: ScheduleTargetProperties & {
    availability_filter: (typeof scheduleAvailabilityFilter)[keyof typeof scheduleAvailabilityFilter];
  };
  /** 월별 또는 주별 캘린더 보기가 실제로 변경됐을 때 발생해요. */
  schedule_calendar_view_selected: {
    calendar_view: (typeof scheduleCalendarView)[keyof typeof scheduleCalendarView];
  };
  /** 면접 일정 생성 페이지로 이동하는 버튼을 클릭했을 때 발생해요. */
  schedule_create_click: {
    calendar_view: (typeof scheduleCalendarView)[keyof typeof scheduleCalendarView];
  };
  /** 장소 선택을 완료해 지원자의 로컬 일정 초안을 추가하거나 교체했을 때 발생해요. */
  schedule_draft_changed: ScheduleTargetProperties & {
    applicant_id: number;
    location_type: LocationType;
  };
  /** 기존 면접 일정의 장소 변경 API가 성공했을 때 발생해요. */
  schedule_location_change_complete: {
    applicant_id: number;
    location_type: LocationType;
    part: PartNameType;
  };
  /** 면접 일정 목록의 파트 필터가 선택되거나 해제됐을 때 발생해요. */
  schedule_part_filter_changed:
    | {
        is_filter_applied: false;
      }
    | {
        is_filter_applied: true;
        selected_part: PartNameType;
        selected_part_id: number;
      };
  /** 일정 저장 확인 다이얼로그에서 확인 버튼을 클릭했을 때 발생해요. */
  schedule_save_click: ScheduleTargetProperties & {
    draft_schedule_count: number;
    target_applicant_count: number;
  };
  /** 일정 저장 API가 모두 성공했을 때 발생해요. */
  schedule_save_complete: ScheduleTargetProperties & {
    scheduled_applicant_count: number;
    target_applicant_count: number;
  };
  /** 일정 생성 대상 파트가 실제로 변경됐을 때 발생해요. */
  schedule_target_filter_changed: ScheduleTargetProperties & {
    already_scheduled_count: number;
    filter_type: 'part';
    target_applicant_count: number;
  };
}

export interface ScheduleAnalyticsCommonProperties {
  event_schema_version: 'v1';
}

export type TrackScheduleEvent = <EventName extends keyof ScheduleAnalyticsEventProperties>(
  eventName: EventName,
  properties: ScheduleAnalyticsEventProperties[EventName],
) => void;

export const ScheduleAnalyticsContext = createContext<null | TrackScheduleEvent>(null);

export const useScheduleAnalytics = () => {
  const trackScheduleEvent = useContext(ScheduleAnalyticsContext);

  if (!trackScheduleEvent) {
    throw new Error('ScheduleAnalyticsContext.Provider 안에서 사용해야 해요.');
  }

  return trackScheduleEvent;
};
