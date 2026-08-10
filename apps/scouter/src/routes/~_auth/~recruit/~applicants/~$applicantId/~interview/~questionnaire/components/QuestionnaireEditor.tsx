import type { ReactNode } from 'react';

import { Badge, Button } from '@yourssu-inhouse/interior';
import { FieldArray, type SubmitHandler, useForm, Watch } from 'react-hook-form';

import type {
  AssignedQuestions,
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
import { QuestionSection } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/QuestionSection';
import { teamJobOtherRequirementCategories } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/requirementOptions';

interface QuestionnaireEditorProps {
  activeMembers: ActiveMemberType[];
  applicantId: number;
  assignedQuestions: AssignedQuestions;
  children: (props: QuestionnaireEditorRenderProps) => ReactNode;
  requirements: InterviewRequirements;
}

interface QuestionnaireEditorRenderProps {
  usedRequirementIds: ReadonlySet<number>;
}

export const QuestionnaireEditor = ({
  activeMembers,
  applicantId,
  assignedQuestions,
  children,
  requirements,
}: QuestionnaireEditorProps) => {
  const openAlertDialog = useAlertDialog();
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
  const assignedRequirementIds = assignedQuestions.questions.flatMap((question) =>
    question.requirements.map((requirement) => requirement.id),
  );

  const onSubmit: SubmitHandler<QuestionnaireFormValues> = async (values) => {
    await mutateWithToast({
      applicantId,
      data: {
        questions: toSaveAssignedQuestions(values),
      },
    });
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
        <Watch
          compute={([partQuestions, personalQuestions]) =>
            [...partQuestions, ...personalQuestions].flatMap((question) => question.requirementIds)
          }
          control={control}
          name={['PART', 'PERSONAL'] as const}
          render={(draftRequirementIds) =>
            children({
              usedRequirementIds: new Set([...assignedRequirementIds, ...draftRequirementIds]),
            })
          }
        />

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <FieldArray<QuestionnaireFormValues, 'GLOBAL'>
            control={control}
            name="GLOBAL"
            render={({ fields }) => (
              <QuestionSection
                description="모든 지원자에게 공통으로 묻는 필수 질문이에요."
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
            <p className="text-13 text-red600 whitespace-pre-line" role="alert">
              {errors.form.message}
            </p>
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
  const unusedRequirements = teamJobOtherRequirementCategories.flatMap((category) =>
    requirements[category].filter(({ id }) => id !== undefined && !usedRequirementIds.has(id)),
  );
  if (unusedRequirements.length > 0) {
    validationMessages.push(
      `모든 요구조건을 질문에 한 번 이상 사용해 주세요: ${unusedRequirements
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
    switch (question.category) {
      case 'CULTURE':
        formValues.CULTURE.push({
          assignedInterviewerUserId: question.assignedInterviewerUserId,
          content: question.content,
          isSelected: question.isSelected,
          requirements: question.requirements,
          sourceQuestionId: question.sourceQuestionId,
        });
        break;
      case 'GLOBAL':
        formValues.GLOBAL.push({
          assignedInterviewerUserId: question.assignedInterviewerUserId,
          content: question.content,
          sourceQuestionId: question.sourceQuestionId,
        });
        break;
      case 'PART':
        formValues.PART.push({
          assignedInterviewerUserId: question.assignedInterviewerUserId,
          content: question.content,
          requirementIds: question.requirements.map(({ id }) => id),
        });
        break;
      case 'PERSONAL':
        formValues.PERSONAL.push({
          assignedInterviewerUserId: question.assignedInterviewerUserId,
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
