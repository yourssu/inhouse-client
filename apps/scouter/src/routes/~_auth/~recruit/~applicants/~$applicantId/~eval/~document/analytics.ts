/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

import type { ApplicantStateType, ApplicantType } from '@/apis/applicants/schema';
import type { UpdateApplicantDocumentEvaluationRequestType } from '@/apis/documents/schema';

type NoEventProperties = Record<never, never>;

type PolicyErrorProperties =
  | {
      action_name: 'document_evaluation_submit';
      reason_code: 'quantitative_score_below_minimum' | 'status_evaluation_missing';
    }
  | {
      action_name: 'document_rubric_change';
      reason_code: 'locked_after_submission';
    }
  | {
      action_name: 'document_rubric_save';
      reason_code: 'rubric_item_below_minimum';
    };

export interface DocumentAnalyticsEventProperties {
  /** 서류 문항에서 댓글 추가 버튼을 클릭했을 때 발생해요. */
  document_comment_add_click: NoEventProperties;
  /** 댓글 또는 답글 생성 API가 성공했을 때 발생해요. */
  document_comment_created: {
    comment_type: 'comment' | 'reply';
    question_id: number;
  };
  /** 질문별 정성평가 영역을 펼쳤을 때 발생해요. */
  document_evaluation_section_open: { section_type: 'qualitative' };
  /** 내 평가 제출 또는 수정 API가 성공했을 때 발생해요. */
  document_evaluation_submit: NoEventProperties;
  /** 내 평가 제출 또는 수정 버튼을 클릭했을 때 발생해요. */
  document_evaluation_submit_click: NoEventProperties;
  /** 최종 서류 평가 버튼을 클릭해 결정 모달을 열었을 때 발생해요. */
  document_final_decision_click: {
    unsubmitted_evaluator_count: number;
  };
  /** 최종 서류 평가 API가 성공해 지원자의 최종 합격 또는 불합격 결과가 반영됐을 때 발생해요. */
  document_final_decision_complete: {
    decision_result: Extract<ApplicantStateType, 'DOCUMENT_ACCEPTED' | 'DOCUMENT_REJECTED'>;
    submitted_evaluator_count: number;
    unresolved_evaluator_count: number;
  };
  /** 다른 평가자의 평가 카드를 펼쳤을 때 발생해요. */
  document_peer_evaluator_view: NoEventProperties;
  /** 질문별 다른 평가자 점수 영역을 펼쳤을 때 발생해요. */
  document_question_peer_score_view: {
    peer_submitted_count: number;
    question_id: number;
  };
  /** 평가 결과 선택 목록을 열었을 때 발생해요. */
  document_result_dropdown_open: NoEventProperties;
  /** 기존 값과 다른 평가 결과를 선택했을 때 발생해요. */
  document_result_selected: {
    evaluation_result: UpdateApplicantDocumentEvaluationRequestType['result'];
  };
  /** 문항 배점 저장 API가 성공했을 때 발생해요. */
  document_rubric_complete: {
    rubric_total_score: number;
  };
  /** 문항 배점 설정 다이얼로그를 열었을 때 발생해요. */
  document_rubric_open: NoEventProperties;
  /** 활성화된 문항 배점 저장 버튼을 클릭했을 때 발생해요. */
  document_rubric_save_click: { rubric_total_score: number };
  /** 정책상 허용되지 않은 동작이나 폼 정책 오류를 사용자에게 보여줬을 때 발생해요. */
  policy_error_view: PolicyErrorProperties;
}

export interface DocumentAnalyticsCommonProperties {
  applicant_id: number;
  applicant_state: ApplicantStateType;
  application_semester: ApplicantType['applicationSemester'];
  assignment_required: boolean;
  event_schema_version: 'v1';
  my_evaluation_status: 'not_submitted' | 'submitted';
  part_id: number;
}

export type TrackDocumentEvent = <EventName extends keyof DocumentAnalyticsEventProperties>(
  eventName: EventName,
  properties: DocumentAnalyticsEventProperties[EventName],
) => void;

export const DocumentAnalyticsContext = createContext<null | TrackDocumentEvent>(null);

export const useDocumentAnalytics = () => {
  const trackDocumentEvent = useContext(DocumentAnalyticsContext);

  if (!trackDocumentEvent) {
    throw new Error('DocumentAnalyticsContext.Provider 안에서 사용해야 해요.');
  }

  return trackDocumentEvent;
};
