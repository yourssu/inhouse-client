import { useQueryClient } from '@tanstack/react-query';
import { useEffectOnce } from '@yourssu-inhouse/inhouse-react/hooks';
import { Badge, Button, useToast } from '@yourssu-inhouse/interior';
import { useRef, useState } from 'react';
import {
  FieldArray,
  type SubmitErrorHandler,
  type SubmitHandler,
  useForm,
  Watch,
} from 'react-hook-form';
import { IoMdAlert } from 'react-icons/io';

import type {
  AssignedQuestions,
  QuestionCategory,
  SaveAssignedQuestionsRequest,
} from '@/apis/interviews/questions/schema';
import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';
import type { ActiveMemberType } from '@/apis/members/schema';

import {
  interviewEvaluatorStatusesOption,
  myInterviewEvaluationOption,
} from '@/apis/interviews/evaluations/query';
import {
  assignedQuestionsOption,
  saveAssignedQuestionsMutationOptions,
} from '@/apis/interviews/questions/query';
import { FieldErrorMessage } from '@/components/FieldErrorMessage';
import { Paper } from '@/components/Paper';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useToastedMutation } from '@/hooks/useToastedMutation';

import type { QuestionnaireSaveErrorCode } from '../../analytics';
import type { QuestionnaireFormValues } from './questionnaireForm';

import { useQuestionnaireAnalytics } from '../../analytics';
import { CultureQuestionCard } from './QuestionCards/CultureQuestionCard';
import { PartQuestionCard } from './QuestionCards/PartQuestionCard';
import { PersonalQuestionCard } from './QuestionCards/PersonalQuestionCard';
import { RequiredQuestionCard } from './QuestionCards/RequiredQuestionCard';
import { isQuestionnaireLocked } from './questionnaireLock';
import { QuestionSection } from './QuestionSection';
import { teamJobRequirementCategories } from './Requirements/requirementOptions';
import { RequirementsSection } from './Requirements/RequirementsSection';

const questionnaireDisabledMessage = '면접 평가가 제출되어 질문지를 수정할 수 없어요.';
const sharedQuestionDisabledMessage =
  '파트의 면접 평가가 진행되어 컬처핏·파트 공통 질문을 수정할 수 없어요.';

interface QuestionnaireEditorProps {
  activeMembers: ActiveMemberType[];
  applicantId: number;
  assignedQuestions: AssignedQuestions;
  isQuestionnaireDisabled: boolean;
  isSharedQuestionDisabled: boolean;
  requirements: InterviewRequirements;
}

export const QuestionnaireEditor = ({
  activeMembers,
  applicantId,
  assignedQuestions,
  isQuestionnaireDisabled,
  isSharedQuestionDisabled,
  requirements,
}: QuestionnaireEditorProps) => {
  const openAlertDialog = useAlertDialog();
  const queryClient = useQueryClient();
  const trackQuestionnaireEvent = useQuestionnaireAnalytics();
  const toast = useToast();
  const [questionSectionOpenByCategory, setQuestionSectionOpenByCategory] = useState<
    Record<QuestionCategory, boolean>
  >({
    INTRO: true,
    CULTURE: true,
    PART: true,
    PERSONAL: true,
    OUTRO: true,
  });
  const errorSummaryRef = useRef<HTMLParagraphElement>(null);
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    reset,
  } = useForm<QuestionnaireFormValues>({
    mode: 'onChange',
    validate: ({ eventType, formValues }) => {
      if (eventType !== 'submit') {
        return true;
      }

      return validateQuestionnaire({
        questions: formValues,
        requirements,
      });
    },
    values: toQuestionnaireFormValues(assignedQuestions),
  });
  const { isPending, mutateWithToast } = useToastedMutation({
    ...saveAssignedQuestionsMutationOptions,
    successText: '질문지를 저장했어요.',
  });
  const disabledDescription = isQuestionnaireDisabled
    ? {
        id: 'questionnaire-disabled-description',
        message: questionnaireDisabledMessage,
      }
    : isSharedQuestionDisabled
      ? {
          id: 'shared-question-disabled-description',
          message: sharedQuestionDisabledMessage,
        }
      : undefined;
  const isSharedQuestionEditingDisabled = isQuestionnaireDisabled || isSharedQuestionDisabled;
  /** NOTE: RHF는 객체 형태의 폼 검증 결과를 errors.form.<key>에 저장하지만 공개 타입에는 반영하지 않아요. */
  const formErrors = errors.form as QuestionnaireFormValidationErrors | undefined;
  const formErrorMessages = [formErrors?.CULTURE?.message, formErrors?.PART?.message].filter(
    (message) => message !== undefined,
  );

  useEffectOnce(() => {
    if (isQuestionnaireDisabled) {
      trackQuestionnaireEvent('questionnaire_lock_view', {
        editable_scope: 'none',
        lock_scope: 'all_current_questionnaire',
        lock_trigger: 'applicant_evaluation_submitted',
      });
      return;
    }

    if (isSharedQuestionDisabled) {
      trackQuestionnaireEvent('questionnaire_lock_view', {
        editable_scope: 'questioner_and_personal_questions',
        lock_scope: 'shared_questions',
        lock_trigger: 'part_interview_started',
      });
    }
  });

  const onSubmit: SubmitHandler<QuestionnaireFormValues> = async (values) => {
    if (isQuestionnaireDisabled) {
      return;
    }

    // 폼을 편집하는 동안 평가가 제출됐을 수 있어, 저장 직전에 최신 상태를 다시 확인해요.
    const [evaluatorStatuses, myEvaluation] = await Promise.all([
      queryClient.fetchQuery({
        ...interviewEvaluatorStatusesOption(applicantId),
        staleTime: 0,
      }),
      queryClient.fetchQuery({
        ...myInterviewEvaluationOption(applicantId),
        staleTime: 0,
      }),
    ]);
    const isLocked = isQuestionnaireLocked({ evaluatorStatuses, myEvaluation });

    if (isLocked) {
      const latestAssignedQuestions = await queryClient.fetchQuery({
        ...assignedQuestionsOption(applicantId),
        staleTime: 0,
      });
      reset(toQuestionnaireFormValues(latestAssignedQuestions));
      toast.error(questionnaireDisabledMessage);
      trackQuestionnaireEvent('questionnaire_save_error_view', {
        error_codes: ['locked'],
      });
      return;
    }

    const saveResult = await mutateWithToast({
      applicantId,
      data: {
        questions: toSaveAssignedQuestions(values),
      },
    });

    if (saveResult.success) {
      const cultureSelectedCount = values.CULTURE.filter(
        ({ isSelected }) => isSelected === true,
      ).length;

      trackQuestionnaireEvent('questionnaire_save_complete', {
        culture_selected_count: cultureSelectedCount,
        part_question_count: values.PART.length,
        personal_question_count: values.PERSONAL.length,
        question_count:
          values.INTRO.length +
          values.OUTRO.length +
          cultureSelectedCount +
          values.PART.length +
          values.PERSONAL.length,
      });
    }
  };

  const onInvalid: SubmitErrorHandler<QuestionnaireFormValues> = (fieldErrors) => {
    const errorCodes = new Set<QuestionnaireSaveErrorCode>();

    questionCategories.forEach((category) => {
      const categoryErrors = fieldErrors[category];

      if (!Array.isArray(categoryErrors)) {
        return;
      }

      categoryErrors.forEach((questionErrors) => {
        if (questionErrors?.assignedMemberId !== undefined) {
          errorCodes.add('questioner_missing');
        }

        if (questionErrors && 'content' in questionErrors && questionErrors.content !== undefined) {
          errorCodes.add('question_content_missing');
        }

        if (
          questionErrors &&
          'requirementIds' in questionErrors &&
          questionErrors.requirementIds !== undefined
        ) {
          errorCodes.add('question_requirement_missing');
        }
      });
    });

    const submittedFormErrors = fieldErrors.form as QuestionnaireFormValidationErrors | undefined;
    const cultureFormError = submittedFormErrors?.CULTURE;
    const requirementFormError = submittedFormErrors?.PART;

    if (cultureFormError) {
      errorCodes.add(cultureFormError.type);
    }

    if (requirementFormError) {
      errorCodes.add(requirementFormError.type);
    }

    trackQuestionnaireEvent('questionnaire_save_error_view', {
      error_codes: [...errorCodes],
    });

    const invalidCategories = questionCategories.filter(
      (category) => fieldErrors[category] !== undefined,
    );

    if (invalidCategories.length > 0) {
      setQuestionSectionOpenByCategory((current) => {
        const next = { ...current };
        invalidCategories.forEach((category) => {
          next[category] = true;
        });
        return next;
      });
      return;
    }

    if (cultureFormError || requirementFormError) {
      // 오류 메시지 요소가 아직 렌더링되지 않았을 수 있으므로 다음 프레임에서 포커스를 설정해요.
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
    }
  };

  const handleQuestionSectionOpenChange = (category: QuestionCategory, isOpen: boolean) => {
    setQuestionSectionOpenByCategory((current) => ({
      ...current,
      [category]: isOpen,
    }));
  };

  return (
    <Paper className="w-full flex-col gap-6 p-5">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">면접 질문지</h2>
        <Watch
          compute={({ CULTURE, INTRO, OUTRO, PART, PERSONAL }) =>
            INTRO.length +
            OUTRO.length +
            CULTURE.filter(({ isSelected }) => isSelected === true).length +
            PART.length +
            PERSONAL.length
          }
          control={control}
          render={(selectedQuestionCount) => (
            <Badge color="violet" size="md">
              {selectedQuestionCount}개
            </Badge>
          )}
        />
      </header>

      {disabledDescription !== undefined && (
        <p
          className="bg-orange50 text-orange600 rounded-10 flex items-center gap-1.5 px-4 py-3 text-sm font-medium"
          id={disabledDescription.id}
        >
          <IoMdAlert aria-hidden className="size-5 shrink-0" />
          <span>{disabledDescription.message}</span>
        </p>
      )}

      <div className="flex flex-col gap-4">
        <RequirementsSection requirements={requirements} />

        <form
          aria-describedby={disabledDescription?.id}
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            if (isQuestionnaireDisabled) {
              event.preventDefault();
              return;
            }

            void handleSubmit(onSubmit, onInvalid)(event);
          }}
        >
          <FieldArray<QuestionnaireFormValues, 'INTRO'>
            control={control}
            name="INTRO"
            render={({ fields }) => (
              <QuestionSection
                description="모든 지원자에게 공통으로 묻는 필수 질문이에요."
                disabled={isQuestionnaireDisabled}
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('INTRO', isOpen)}
                open={questionSectionOpenByCategory.INTRO}
                questions={fields}
                renderQuestion={(question, index) => (
                  <RequiredQuestionCard
                    activeMembers={activeMembers}
                    category="INTRO"
                    control={control}
                    disabled={isQuestionnaireDisabled}
                    index={index}
                    question={question}
                  />
                )}
                title="인트로 필수 질문"
              />
            )}
          />

          <FieldArray<QuestionnaireFormValues, 'CULTURE'>
            control={control}
            name="CULTURE"
            render={({ fields }) => (
              <QuestionSection
                description="면접에서 사용할 질문을 2개 이상 선택해요."
                disabled={isSharedQuestionEditingDisabled}
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('CULTURE', isOpen)}
                open={questionSectionOpenByCategory.CULTURE}
                questions={fields}
                renderQuestion={(question, index) => (
                  <CultureQuestionCard
                    activeMembers={activeMembers}
                    control={control}
                    index={index}
                    isInterviewerDisabled={isQuestionnaireDisabled}
                    isSelectionDisabled={isSharedQuestionEditingDisabled}
                    question={question}
                  />
                )}
                title="컬처핏 질문"
              />
            )}
          />

          <FieldArray<QuestionnaireFormValues, 'PART'>
            control={control}
            name="PART"
            render={({ append, fields, remove }) => (
              <QuestionSection
                description="같은 파트 지원자에게 공통으로 사용하는 질문이에요."
                disabled={isSharedQuestionEditingDisabled}
                onAddQuestion={() => {
                  append({
                    assignedMemberId: undefined,
                    content: '',
                    requirementIds: [],
                  });
                  trackQuestionnaireEvent('questionnaire_question_added', {
                    question_category: 'PART',
                  });
                }}
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('PART', isOpen)}
                open={questionSectionOpenByCategory.PART}
                questions={fields}
                renderQuestion={(_, index) => (
                  <PartQuestionCard
                    activeMembers={activeMembers}
                    control={control}
                    index={index}
                    isInterviewerDisabled={isQuestionnaireDisabled}
                    isQuestionEditingDisabled={isSharedQuestionEditingDisabled}
                    onDelete={async () => {
                      const isConfirmed = await openAlertDialog({
                        title: '파트 공통 질문을 삭제할까요?',
                        content: '같은 파트 지원자의 질문지에도 영향을 줄 수 있어요.',
                        primaryButtonText: '삭제',
                        secondaryButtonText: '취소',
                      });
                      if (isConfirmed) {
                        remove(index);
                        trackQuestionnaireEvent('questionnaire_question_deleted', {
                          question_category: 'PART',
                        });
                      }
                    }}
                    requirements={requirements}
                  />
                )}
                title="파트 공통 질문"
              />
            )}
          />

          <FieldArray<QuestionnaireFormValues, 'PERSONAL'>
            control={control}
            name="PERSONAL"
            render={({ append, fields, remove }) => (
              <QuestionSection
                description="지원자에게만 묻는 개인 질문이에요."
                disabled={isQuestionnaireDisabled}
                onAddQuestion={() => {
                  append({
                    assignedMemberId: undefined,
                    content: '',
                    requirementIds: [],
                  });
                  trackQuestionnaireEvent('questionnaire_question_added', {
                    question_category: 'PERSONAL',
                  });
                }}
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('PERSONAL', isOpen)}
                open={questionSectionOpenByCategory.PERSONAL}
                questions={fields}
                renderQuestion={(_, index) => (
                  <PersonalQuestionCard
                    activeMembers={activeMembers}
                    control={control}
                    disabled={isQuestionnaireDisabled}
                    index={index}
                    onDelete={async () => {
                      remove(index);
                      trackQuestionnaireEvent('questionnaire_question_deleted', {
                        question_category: 'PERSONAL',
                      });
                    }}
                    requirements={requirements}
                  />
                )}
                title="지원자 개인 질문"
              />
            )}
          />

          <FieldArray<QuestionnaireFormValues, 'OUTRO'>
            control={control}
            name="OUTRO"
            render={({ fields }) => (
              <QuestionSection
                description="모든 지원자에게 공통으로 묻는 필수 질문이에요."
                disabled={isQuestionnaireDisabled}
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('OUTRO', isOpen)}
                open={questionSectionOpenByCategory.OUTRO}
                questions={fields}
                renderQuestion={(question, index) => (
                  <RequiredQuestionCard
                    activeMembers={activeMembers}
                    category="OUTRO"
                    control={control}
                    disabled={isQuestionnaireDisabled}
                    index={index}
                    question={question}
                  />
                )}
                title="아웃트로 필수 질문"
              />
            )}
          />

          {formErrorMessages.length > 0 && (
            <FieldErrorMessage ref={errorSummaryRef} tabIndex={-1}>
              {formErrorMessages.join('\n')}
            </FieldErrorMessage>
          )}

          <div className="bg-lightBackground sticky bottom-0 z-10 py-3">
            <Button
              className="w-full"
              disabled={isQuestionnaireDisabled || !isDirty}
              loading={isPending}
              onClick={() => trackQuestionnaireEvent('questionnaire_save_click', {})}
              size="md"
              type="submit"
            >
              질문지 저장
            </Button>
          </div>
        </form>
      </div>
    </Paper>
  );
};

const questionCategories = [
  'INTRO',
  'CULTURE',
  'PART',
  'PERSONAL',
  'OUTRO',
] as const satisfies ReadonlyArray<QuestionCategory>;

interface ValidateQuestionnaireParams {
  questions: QuestionnaireFormValues;
  requirements: InterviewRequirements;
}

interface QuestionnaireFormValidationErrors {
  CULTURE?: {
    message: string;
    type: 'culture_min_not_met';
  };
  PART?: {
    message: string;
    type: 'required_requirement_unmapped';
  };
}

const validateQuestionnaire = ({
  questions,
  requirements,
}: ValidateQuestionnaireParams): QuestionnaireFormValidationErrors | true => {
  const validationErrors: QuestionnaireFormValidationErrors = {};
  const cultureQuestions = questions.CULTURE;

  if (cultureQuestions.filter(({ isSelected }) => isSelected === true).length < 2) {
    validationErrors.CULTURE = {
      message: '컬처핏 질문을 2개 이상 선택해 주세요.',
      type: 'culture_min_not_met',
    };
  }

  const usedRequirementIds = new Set(
    [...questions.PART, ...questions.PERSONAL].flatMap(({ requirementIds }) => requirementIds),
  );
  const unusedRequirements = teamJobRequirementCategories.flatMap((category) =>
    requirements[category].filter(({ id }) => id !== undefined && !usedRequirementIds.has(id)),
  );
  if (unusedRequirements.length > 0) {
    validationErrors.PART = {
      message: `Team fit과 Job fit 요구조건을 질문에 한 번 이상 사용해 주세요: ${unusedRequirements
        .map(({ content }) => content)
        .join(', ')}`,
      type: 'required_requirement_unmapped',
    };
  }

  return Object.keys(validationErrors).length === 0 ? true : validationErrors;
};

const toQuestionnaireFormValues = ({ questions }: AssignedQuestions): QuestionnaireFormValues => {
  const formValues: QuestionnaireFormValues = {
    INTRO: [],
    CULTURE: [],
    PART: [],
    PERSONAL: [],
    OUTRO: [],
  };

  questions.forEach((question) => {
    const assignedMemberId = question.assignedMemberId ?? undefined;

    switch (question.category) {
      case 'CULTURE':
        formValues.CULTURE.push({
          assignedMemberId,
          content: question.content,
          isSelected: question.isSelected ?? undefined,
          requirements: question.requirements,
          sourceQuestionId: question.sourceQuestionId ?? undefined,
        });
        break;
      case 'INTRO':
      case 'OUTRO':
        formValues[question.category].push({
          assignedMemberId,
          content: question.content,
          sourceQuestionId: question.sourceQuestionId ?? undefined,
        });
        break;
      case 'PART':
        formValues.PART.push({
          assignedMemberId,
          content: question.content,
          requirementIds: question.requirements.map(({ id }) => id),
          sourceQuestionId: question.sourceQuestionId ?? undefined,
        });
        break;
      case 'PERSONAL':
        formValues.PERSONAL.push({
          assignedMemberId,
          content: question.content,
          requirementIds: question.requirements.map(({ id }) => id),
        });
        break;
    }
  });

  return formValues;
};

const toSaveAssignedQuestions = (
  values: QuestionnaireFormValues,
): SaveAssignedQuestionsRequest['questions'] => [
  ...values.INTRO.map((question) => ({
    assignedMemberId: question.assignedMemberId!,
    category: 'INTRO' as const,
    sourceQuestionId: question.sourceQuestionId,
  })),
  // 선택하지 않은 컬처핏 질문은 질문자가 배정되지 않으므로 저장 대상에서 제외해요.
  ...values.CULTURE.filter(({ isSelected }) => isSelected === true).map((question) => ({
    assignedMemberId: question.assignedMemberId!,
    category: 'CULTURE' as const,
    isSelected: true,
    sourceQuestionId: question.sourceQuestionId,
  })),
  ...values.PART.map((question) => ({
    assignedMemberId: question.assignedMemberId!,
    category: 'PART' as const,
    content: question.content.trim(),
    requirementIds: question.requirementIds,
    sourceQuestionId: question.sourceQuestionId ?? null,
  })),
  ...values.PERSONAL.map((question) => ({
    assignedMemberId: question.assignedMemberId!,
    category: 'PERSONAL' as const,
    content: question.content.trim(),
    requirementIds: question.requirementIds,
  })),
  ...values.OUTRO.map((question) => ({
    assignedMemberId: question.assignedMemberId!,
    category: 'OUTRO' as const,
    sourceQuestionId: question.sourceQuestionId,
  })),
];
