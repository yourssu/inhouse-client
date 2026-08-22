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

import { saveAssignedQuestionsMutationOptions } from '@/apis/interviews/questions/query';
import { FieldErrorMessage } from '@/components/FieldErrorMessage';
import { Paper } from '@/components/Paper';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useToastedMutation } from '@/hooks/useToastedMutation';

import type { QuestionnaireFormValues } from './questionnaireForm';

import { CultureQuestionCard } from './QuestionCards/CultureQuestionCard';
import { PartQuestionCard } from './QuestionCards/PartQuestionCard';
import { PersonalQuestionCard } from './QuestionCards/PersonalQuestionCard';
import { RequiredQuestionCard } from './QuestionCards/RequiredQuestionCard';
import { QuestionSection } from './QuestionSection';
import { teamJobRequirementCategories } from './Requirements/requirementOptions';
import { RequirementsSection } from './Requirements/RequirementsSection';

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

      <div className="flex flex-col gap-4">
        <RequirementsSection requirements={requirements} />

        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            void handleSubmit(onSubmit, onInvalid)(event);
          }}
        >
          <FieldArray<QuestionnaireFormValues, 'INTRO'>
            control={control}
            name="INTRO"
            render={({ fields }) => (
              <QuestionSection
                description="모든 지원자에게 공통으로 묻는 필수 질문이에요."
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('INTRO', isOpen)}
                open={questionSectionOpenByCategory.INTRO}
                questions={fields}
                renderQuestion={(question, index) => (
                  <RequiredQuestionCard
                    activeMembers={activeMembers}
                    category="INTRO"
                    control={control}
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
                    assignedMemberId: undefined,
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
                    assignedMemberId: undefined,
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

          <FieldArray<QuestionnaireFormValues, 'OUTRO'>
            control={control}
            name="OUTRO"
            render={({ fields }) => (
              <QuestionSection
                description="모든 지원자에게 공통으로 묻는 필수 질문이에요."
                onOpenChange={(isOpen) => handleQuestionSectionOpenChange('OUTRO', isOpen)}
                open={questionSectionOpenByCategory.OUTRO}
                questions={fields}
                renderQuestion={(question, index) => (
                  <RequiredQuestionCard
                    activeMembers={activeMembers}
                    category="OUTRO"
                    control={control}
                    index={index}
                    question={question}
                  />
                )}
                title="아웃트로 필수 질문"
              />
            )}
          />

          {errors.form?.message && (
            <FieldErrorMessage ref={errorSummaryRef} tabIndex={-1}>
              {errors.form.message}
            </FieldErrorMessage>
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
