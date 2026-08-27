/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

import type { ApplicantStateType, ApplicantType } from '@/apis/applicants/schema';
import type { QuestionCategory } from '@/apis/interviews/questions/schema';

type NoEventProperties = Record<never, never>;

export type QuestionnaireSaveErrorCode =
  | 'culture_min_not_met'
  | 'locked'
  | 'question_content_missing'
  | 'question_requirement_missing'
  | 'questioner_missing'
  | 'required_requirement_unmapped';

export interface QuestionnaireAnalyticsEventProperties {
  /** 지원서 문항에서 댓글 추가 버튼을 클릭했을 때 발생해요. */
  questionnaire_comment_add_click: NoEventProperties;
  /** 댓글 또는 답글 생성 API가 성공했을 때 발생해요. */
  questionnaire_comment_created: {
    comment_type: 'comment' | 'reply';
    question_id: number;
  };
  /** 질문지 페이지에 처음 진입했을 때 전체 또는 공유 질문이 잠겨 있으면 발생해요. */
  questionnaire_lock_view:
    | {
        editable_scope: 'none';
        lock_scope: 'all_current_questionnaire';
        lock_trigger: 'applicant_evaluation_submitted';
      }
    | {
        editable_scope: 'questioner_and_personal_questions';
        lock_scope: 'shared_questions';
        lock_trigger: 'part_interview_started';
      };
  /** 파트 공통 또는 지원자 개인 질문을 추가했을 때 발생해요. */
  questionnaire_question_added: {
    question_category: Extract<QuestionCategory, 'PART' | 'PERSONAL'>;
  };
  /** 파트 공통 또는 지원자 개인 질문을 실제로 삭제했을 때 발생해요. */
  questionnaire_question_deleted: {
    question_category: Extract<QuestionCategory, 'PART' | 'PERSONAL'>;
  };
  /** 컬처핏 질문의 선택 상태가 실제로 변경됐을 때 발생해요. */
  questionnaire_question_selection_changed: {
    is_selected: boolean;
  };
  /** 질문자가 기존 값과 다른 멤버로 변경됐을 때 발생해요. */
  questionnaire_questioner_changed: {
    assigned_member_id: number;
    question_category: QuestionCategory;
  };
  /** 질문에 연결된 요구조건 구성이 실제로 변경됐을 때 발생해요. */
  questionnaire_requirement_mapping_changed: {
    question_category: Extract<QuestionCategory, 'PART' | 'PERSONAL'>;
    selected_requirement_count: number;
  };
  /** 질문지 상단의 요구조건 영역을 펼쳤을 때 발생해요. */
  questionnaire_requirements_open: {
    requirement_count: number;
  };
  /** 활성화된 질문지 저장 버튼을 클릭했을 때 발생해요. */
  questionnaire_save_click: NoEventProperties;
  /** 질문지 저장 API가 성공했을 때 발생해요. */
  questionnaire_save_complete: {
    culture_selected_count: number;
    part_question_count: number;
    personal_question_count: number;
    question_count: number;
  };
  /** 질문지 저장 시 사용자에게 폼 검증 또는 정책 차단 안내가 표시됐을 때 발생해요. */
  questionnaire_save_error_view: {
    error_codes: QuestionnaireSaveErrorCode[];
  };
}

export interface QuestionnaireAnalyticsCommonProperties {
  applicant_id: number;
  applicant_state: ApplicantStateType;
  application_semester: ApplicantType['applicationSemester'];
  event_schema_version: 'v1';
  part_id: number;
}

export type TrackQuestionnaireEvent = <
  EventName extends keyof QuestionnaireAnalyticsEventProperties,
>(
  eventName: EventName,
  properties: QuestionnaireAnalyticsEventProperties[EventName],
) => void;

export const QuestionnaireAnalyticsContext = createContext<null | TrackQuestionnaireEvent>(null);

export const useQuestionnaireAnalytics = () => {
  const trackQuestionnaireEvent = useContext(QuestionnaireAnalyticsContext);

  if (!trackQuestionnaireEvent) {
    throw new Error('QuestionnaireAnalyticsContext.Provider 안에서 사용해야 해요.');
  }

  return trackQuestionnaireEvent;
};
