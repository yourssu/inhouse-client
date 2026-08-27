/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

import type { ApplicantStateType, ApplicantType } from '@/apis/applicants/schema';

type NoEventProperties = Record<never, never>;

export interface InterviewAnalyticsEventProperties {
  /** 좌측 지원서 카드를 열어 지원서 내용을 표시했을 때 발생해요. */
  interview_application_card_open: NoEventProperties;
  /** 내 평가 제출 또는 다시 제출 API가 성공했을 때 발생해요. */
  interview_evaluation_submit: NoEventProperties;
  /** 내 평가 제출 또는 다시 제출 버튼을 클릭했을 때 발생해요. */
  interview_evaluation_submit_click: NoEventProperties;
  /** 최종 면접 결과 결정 버튼을 클릭해 모달을 열었을 때 발생해요. */
  interview_final_decision_click: NoEventProperties;
  /** 다른 평가자 목록에서 특정 평가자의 상세 평가를 열었을 때 발생해요. */
  interview_peer_evaluator_view: {
    peer_evaluator_id: number;
  };
  /** 좌측 질문 카드를 열어 질문 내용을 표시했을 때 발생해요. */
  interview_question_card_open: {
    assigned_member_id: number;
    question_id: number;
  };
  /** 질문 카드의 메모 생성 API가 성공했을 때 발생해요. */
  interview_question_memo_saved: {
    question_id: number;
  };
  /** 루브릭 평가 항목의 다른 평가자 정량 점수를 표시했을 때 발생해요. */
  interview_question_peer_score_view: {
    evaluation_item_id: number;
  };
  /** 면접 배점 변경 버튼을 클릭했을 때 발생해요. */
  interview_rubric_change_click: {
    is_locked: boolean;
  };
  /** 면접 배점 저장 API가 성공했을 때 발생해요. */
  interview_rubric_complete: {
    rubric_total_score: number;
  };
}

export interface InterviewAnalyticsCommonProperties {
  applicant_id: number;
  applicant_state: ApplicantStateType;
  application_semester: ApplicantType['applicationSemester'];
  event_schema_version: 'v1';
  part_id: number;
}

export type TrackInterviewEvent = <EventName extends keyof InterviewAnalyticsEventProperties>(
  eventName: EventName,
  properties: InterviewAnalyticsEventProperties[EventName],
) => void;

export const InterviewAnalyticsContext = createContext<null | TrackInterviewEvent>(null);

export const useInterviewAnalytics = () => {
  const trackInterviewEvent = useContext(InterviewAnalyticsContext);

  if (!trackInterviewEvent) {
    throw new Error('InterviewAnalyticsContext.Provider 안에서 사용해야 해요.');
  }

  return trackInterviewEvent;
};
