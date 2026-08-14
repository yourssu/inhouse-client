import type { ReactNode } from 'react';

import { MultilineTextField } from '@yourssu-inhouse/interior';
import { type Control, Controller } from 'react-hook-form';

import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';
import type { QuestionnaireFormValues } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionnaireForm';

import { QuestionnaireErrorMessage } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/QuestionnaireErrorMessage';
import { RequirementPicker } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/RequirementPicker';

interface EditableQuestionFieldsProps {
  category: 'PART' | 'PERSONAL';
  control: Control<QuestionnaireFormValues>;
  deleteButton: ReactNode;
  index: number;
  requirements: InterviewRequirements;
}

export const EditableQuestionFields = ({
  category,
  control,
  deleteButton,
  index,
  requirements,
}: EditableQuestionFieldsProps) => {
  return (
    <>
      <div className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Controller
            control={control}
            name={`${category}.${index}.content`}
            render={({ field, fieldState }) => (
              <>
                <MultilineTextField
                  {...field}
                  aria-invalid={fieldState.invalid}
                  aria-label="질문"
                  className="min-h-20"
                  invalid={fieldState.invalid}
                  placeholder="질문을 입력하세요"
                  withHeightAutoResize
                />
                {fieldState.error?.message !== undefined && (
                  <QuestionnaireErrorMessage>{fieldState.error.message}</QuestionnaireErrorMessage>
                )}
              </>
            )}
            rules={{
              validate: (content) => {
                if (content.trim() === '') {
                  return '질문 내용을 입력해 주세요.';
                }

                return true;
              },
            }}
          />
        </div>

        {deleteButton}
      </div>

      <div className="flex flex-col gap-1.5">
        <Controller
          control={control}
          name={`${category}.${index}.requirementIds`}
          render={({ field, fieldState }) => (
            <>
              <RequirementPicker
                invalid={fieldState.invalid}
                onChange={field.onChange}
                ref={field.ref}
                requirements={requirements}
                selectedRequirementIds={field.value}
              />
              {fieldState.error?.message !== undefined && (
                <QuestionnaireErrorMessage>{fieldState.error.message}</QuestionnaireErrorMessage>
              )}
            </>
          )}
          rules={{
            validate: (requirementIds) => {
              if (requirementIds.length === 0) {
                return '요구조건을 1개 이상 선택해 주세요.';
              }
            },
          }}
        />
      </div>
    </>
  );
};
