/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

import type { ApplicantStateType, ApplicantType } from '@/apis/applicants/schema';
import type { PartNameType } from '@/apis/parts/schema';

import type { ApplicantTabNameType } from './type';

type ApplicantAnalyticsProperties = {
  applicant_id: number;
  applicant_state: ApplicantStateType;
  application_semester: ApplicantType['applicationSemester'];
  assignment_required: boolean;
  part_id: number;
};

type ApplicantFilterProperties = {
  current_tab: ApplicantTabNameType;
  has_search_query: boolean;
  selected_part?: PartNameType;
  selected_part_id?: number;
  selected_semester?: string;
};

export interface ApplicantsAnalyticsEventProperties {
  /** 지원자 행의 액션 메뉴를 열었을 때 발생해요. */
  applicant_action_menu_open: ApplicantAnalyticsProperties;
  /** 지원자 목록의 파트·학기·검색 필터 상태가 변경됐을 때 발생해요. */
  applicant_filter_changed: ApplicantFilterProperties;
  /** 지원자 목록의 탭이 실제로 변경됐을 때 발생해요. */
  applicant_tab_selected: {
    current_tab: ApplicantTabNameType;
  };
  /** 과제 평가 결과 API가 성공해 지원자의 과제 합격 또는 불합격 결과가 반영됐을 때 발생해요. */
  assignment_evaluation_complete: ApplicantAnalyticsProperties & {
    evaluation_result: Extract<ApplicantStateType, 'ASSIGNMENT_ACCEPTED' | 'ASSIGNMENT_REJECTED'>;
  };
  /** 지원자 액션 메뉴에서 평가 기능 진입을 시도했을 때 발생해요. */
  feature_entry_click: ApplicantAnalyticsProperties & {
    access_result: 'allowed' | 'blocked';
    entry_point: 'applicant_action_menu';
    target_feature:
      'assignment_evaluation' | 'document_evaluation' | 'interview_evaluation' | 'questionnaire';
  };
}

export interface ApplicantsAnalyticsCommonProperties {
  event_schema_version: 'v1';
}

export type TrackApplicantsEvent = <EventName extends keyof ApplicantsAnalyticsEventProperties>(
  eventName: EventName,
  properties: ApplicantsAnalyticsEventProperties[EventName],
) => void;

export const ApplicantsAnalyticsContext = createContext<null | TrackApplicantsEvent>(null);

export const useApplicantsAnalytics = () => {
  const trackApplicantsEvent = useContext(ApplicantsAnalyticsContext);

  if (!trackApplicantsEvent) {
    throw new Error('ApplicantsAnalyticsContext.Provider 안에서 사용해야 해요.');
  }

  return trackApplicantsEvent;
};
