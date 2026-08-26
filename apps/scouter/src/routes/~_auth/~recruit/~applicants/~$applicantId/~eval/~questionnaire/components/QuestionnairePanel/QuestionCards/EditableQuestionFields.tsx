import type { ReactNode } from 'react';

import { MultilineTextField } from '@yourssu-inhouse/interior';
import { type Control, Controller } from 'react-hook-form';

import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';

import { FieldErrorMessage } from '@/components/FieldErrorMessage';

import type { QuestionnaireFormValues } from '../questionnaireForm';

import { useQuestionnaireAnalytics } from '../../../analytics';
import { RequirementPicker } from '../Requirements/RequirementPicker';

interface EditableQuestionFieldsProps {
  category: 'PART' | 'PERSONAL';
  control: Control<QuestionnaireFormValues>;
  deleteButton: ReactNode;
  disabled: boolean;
  index: number;
  requirements: InterviewRequirements;
}

export const EditableQuestionFields = ({
  category,
  control,
  deleteButton,
  disabled,
  index,
  requirements,
}: EditableQuestionFieldsProps) => {
  const trackQuestionnaireEvent = useQuestionnaireAnalytics();

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
                  disabled={disabled}
                  invalid={fieldState.invalid}
                  placeholder="질문을 입력하세요"
                  withHeightAutoResize
                />
                {fieldState.error?.message !== undefined && (
                  <FieldErrorMessage>{fieldState.error.message}</FieldErrorMessage>
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
                disabled={disabled}
                invalid={fieldState.invalid}
                onChange={(requirementIds) => {
                  const currentRequirementIdSet = new Set(field.value);
                  const hasSameRequirementIds =
                    requirementIds.length === field.value.length &&
                    requirementIds.every((requirementId) =>
                      currentRequirementIdSet.has(requirementId),
                    );

                  if (hasSameRequirementIds) {
                    return;
                  }

                  field.onChange(requirementIds);
                  trackQuestionnaireEvent('questionnaire_requirement_mapping_changed', {
                    question_category: category,
                    selected_requirement_count: requirementIds.length,
                  });
                }}
                ref={field.ref}
                requirements={requirements}
                selectedRequirementIds={field.value}
              />
              {fieldState.error?.message !== undefined && (
                <FieldErrorMessage>{fieldState.error.message}</FieldErrorMessage>
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
