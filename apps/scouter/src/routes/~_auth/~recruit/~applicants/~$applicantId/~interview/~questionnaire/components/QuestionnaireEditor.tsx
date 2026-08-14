import { Badge, Button } from '@yourssu-inhouse/interior';
import { useRef, useState } from 'react';
import {
  FieldArray,
  type SubmitErrorHandler,
  type SubmitHandler,
  useForm,
  Watch,
} from 'react-hook-form';

import type {
  AssignedQuestions,
  QuestionCategory,
  SaveAssignedQuestionsRequest,
} from '@/apis/interviews/questions/schema';
import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';
import type { ActiveMemberType } from '@/apis/members/schema';
import type { QuestionnaireFormValues } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionnaireForm';

import { saveAssignedQuestionsMutationOptions } from '@/apis/interviews/questions/query';
import { Paper } from '@/components/Paper';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useToastedMutation } from '@/hooks/useToastedMutation';
import { CultureQuestionCard } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionCards/CultureQuestionCard';
import { GlobalQuestionCard } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionCards/GlobalQuestionCard';
import { PartQuestionCard } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionCards/PartQuestionCard';
import { PersonalQuestionCard } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionCards/PersonalQuestionCard';
import { QuestionnaireErrorMessage } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/QuestionnaireErrorMessage';
import { QuestionSection } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/QuestionSection';
import { teamJobRequirementCategories } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/requirementOptions';
import { RequirementsSection } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/RequirementsSection';

interface QuestionnaireEditorProps {
  activeMembers: ActiveMemberType[];
  applicantId: number;
  assignedQuestions: AssignedQuestions;
  requirements: InterviewRequirements;
}

export const QuestionnaireEditor = ({
  activeMembers,
  applicantId,
  assignedQuestions,
  requirements,
}: QuestionnaireEditorProps) => {
  const openAlertDialog = useAlertDialog();
  const [questionSectionOpenByCategory, setQuestionSectionOpenByCategory] = useState<
    Record<QuestionCategory, boolean>
  >({
    CULTURE: true,
    GLOBAL: true,
    PART: true,
    PERSONAL: true,
  });
  const errorSummaryRef = useRef<HTMLParagraphElement>(null);
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
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

  const onSubmit: SubmitHandler<QuestionnaireFormValues> = async (values) => {
    await mutateWithToast({
      applicantId,
      data: {
        questions: toSaveAssignedQuestions(values),
      },
    });
  };

  const onInvalid: SubmitErrorHandler<QuestionnaireFormValues> = (fieldErrors) => {
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

    if (fieldErrors.form?.message !== undefined) {
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
          compute={({ CULTURE, GLOBAL, PART, PERSONAL }) =>
            GLOBAL.length +
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

      <div className="flex flex-col gap-4">
        <RequirementsSection requirements={requirements} />

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            void handleSubmit(onSubmit, onInvalid)(event);
          }}
        >
          <FieldArray<QuestionnaireFormValues, 'GLOBAL'>
            control={control}
            name="GLOBAL"
            render={({ fields }) => (
              <QuestionSection
                description="모든 지원자에게 공통으로 묻는 필수 질문이에요."
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('GLOBAL', isOpen)}
                open={questionSectionOpenByCategory.GLOBAL}
                questions={fields}
                renderQuestion={(question, index) => (
                  <GlobalQuestionCard
                    activeMembers={activeMembers}
                    control={control}
                    index={index}
                    question={question}
                  />
                )}
                title="필수 질문"
              />
            )}
          />

          <FieldArray<QuestionnaireFormValues, 'CULTURE'>
            control={control}
            name="CULTURE"
            render={({ fields }) => (
              <QuestionSection
                description="면접에서 사용할 질문을 2개 이상 선택해요."
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('CULTURE', isOpen)}
                open={questionSectionOpenByCategory.CULTURE}
                questions={fields}
                renderQuestion={(question, index) => (
                  <CultureQuestionCard
                    activeMembers={activeMembers}
                    control={control}
                    index={index}
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
                onAddQuestion={() =>
                  append({
                    assignedInterviewerUserId: undefined,
                    content: '',
                    requirementIds: [],
                  })
                }
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('PART', isOpen)}
                open={questionSectionOpenByCategory.PART}
                questions={fields}
                renderQuestion={(_, index) => (
                  <PartQuestionCard
                    activeMembers={activeMembers}
                    control={control}
                    index={index}
                    onDelete={async () => {
                      const isConfirmed = await openAlertDialog({
                        title: '파트 공통 질문을 삭제할까요?',
                        content: '같은 파트 지원자의 질문지에도 영향을 줄 수 있어요.',
                        primaryButtonText: '삭제',
                        secondaryButtonText: '취소',
                      });
                      if (isConfirmed) {
                        remove(index);
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
                onAddQuestion={() =>
                  append({
                    assignedInterviewerUserId: undefined,
                    content: '',
                    requirementIds: [],
                  })
                }
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('PERSONAL', isOpen)}
                open={questionSectionOpenByCategory.PERSONAL}
                questions={fields}
                renderQuestion={(_, index) => (
                  <PersonalQuestionCard
                    activeMembers={activeMembers}
                    control={control}
                    index={index}
                    onDelete={async () => remove(index)}
                    requirements={requirements}
                  />
                )}
                title="지원자 개인 질문"
              />
            )}
          />

          {errors.form?.message && (
            <QuestionnaireErrorMessage ref={errorSummaryRef} tabIndex={-1}>
              {errors.form.message}
            </QuestionnaireErrorMessage>
          )}

          <div className="bg-lightBackground sticky bottom-0 z-10 py-3">
            <Button
              className="w-full"
              disabled={!isDirty}
              loading={isPending}
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
  'GLOBAL',
  'CULTURE',
  'PART',
  'PERSONAL',
] as const satisfies ReadonlyArray<QuestionCategory>;

interface ValidateQuestionnaireParams {
  questions: QuestionnaireFormValues;
  requirements: InterviewRequirements;
}

const validateQuestionnaire = ({ questions, requirements }: ValidateQuestionnaireParams) => {
  const validationMessages: string[] = [];
  const cultureQuestions = questions.CULTURE;

  if (cultureQuestions.filter(({ isSelected }) => isSelected === true).length < 2) {
    validationMessages.push('컬처핏 질문을 2개 이상 선택해 주세요.');
  }

  const usedRequirementIds = new Set(
    [...questions.PART, ...questions.PERSONAL].flatMap(({ requirementIds }) => requirementIds),
  );
  const unusedRequirements = teamJobRequirementCategories.flatMap((category) =>
    requirements[category].filter(({ id }) => id !== undefined && !usedRequirementIds.has(id)),
  );
  if (unusedRequirements.length > 0) {
    validationMessages.push(
      `Team fit과 Job fit 요구조건을 질문에 한 번 이상 사용해 주세요: ${unusedRequirements
        .map(({ content }) => content)
        .join(', ')}`,
    );
  }

  return validationMessages.length === 0 || validationMessages.join('\n');
};

const toQuestionnaireFormValues = ({ questions }: AssignedQuestions): QuestionnaireFormValues => {
  const formValues: QuestionnaireFormValues = {
    GLOBAL: [],
    CULTURE: [],
    PART: [],
    PERSONAL: [],
  };

  questions.forEach((question) => {
    const assignedInterviewerUserId = question.assignedInterviewerUserId ?? undefined;

    switch (question.category) {
      case 'CULTURE':
        formValues.CULTURE.push({
          assignedInterviewerUserId,
          content: question.content,
          isSelected: question.isSelected ?? undefined,
          requirements: question.requirements,
          sourceQuestionId: question.sourceQuestionId ?? undefined,
        });
        break;
      case 'GLOBAL':
        formValues.GLOBAL.push({
          assignedInterviewerUserId,
          content: question.content,
          sourceQuestionId: question.sourceQuestionId ?? undefined,
        });
        break;
      case 'PART':
        formValues.PART.push({
          assignedInterviewerUserId,
          content: question.content,
          requirementIds: question.requirements.map(({ id }) => id),
        });
        break;
      case 'PERSONAL':
        formValues.PERSONAL.push({
          assignedInterviewerUserId,
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
  ...values.GLOBAL.map((question) => ({
    assignedInterviewerUserId: question.assignedInterviewerUserId!,
    category: 'GLOBAL' as const,
    requirementIds: [],
    sourceQuestionId: question.sourceQuestionId,
  })),
  ...values.CULTURE.map((question) => ({
    assignedInterviewerUserId: question.assignedInterviewerUserId,
    category: 'CULTURE' as const,
    isSelected: question.isSelected,
    requirementIds: question.requirements.map(({ id }) => id),
    sourceQuestionId: question.sourceQuestionId,
  })),
  ...values.PART.map((question) => ({
    assignedInterviewerUserId: question.assignedInterviewerUserId!,
    category: 'PART' as const,
    content: question.content.trim(),
    requirementIds: question.requirementIds,
  })),
  ...values.PERSONAL.map((question) => ({
    assignedInterviewerUserId: question.assignedInterviewerUserId!,
    category: 'PERSONAL' as const,
    content: question.content.trim(),
    requirementIds: question.requirementIds,
  })),
];
