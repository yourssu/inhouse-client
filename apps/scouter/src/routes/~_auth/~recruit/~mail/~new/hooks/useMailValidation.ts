import type { ApplicantType } from '@/apis/applicants/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';

import {
  isLinkValue,
  type VariableValueType,
} from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

interface UseMailValidationProps {
  formData: TemplateFormData;
  receivers: ApplicantType[];
  variableValues: Record<string, VariableValueType>;
}

export const useMailValidation = ({
  formData,
  receivers,
  variableValues,
}: UseMailValidationProps) => {
  const isAnyVariableUnset = formData.variables
    .filter((v) => !v.isDefault)
    .some((v) => {
      if (v.isDifferentPerPerson) {
        return receivers.some((applicant) => {
          const val = variableValues[`${v.id}_${applicant.name}`];
          if (v.type === 'LINK') {
            if (!isLinkValue(val)) {
              return true;
            }
            return !val.url?.trim();
          }
          return !val;
        });
      }
      const val = variableValues[v.id];
      if (v.type === 'LINK') {
        if (!isLinkValue(val)) {
          return true;
        }
        return !val.url?.trim();
      }
      return !val;
    });

  const isSubjectEmpty = !formData.subject.trim();
  const isContentEmpty =
    !formData.content.trim() ||
    formData.content === '<p></p>' ||
    formData.content === '<div></div>';
  const isSendDisabled = isSubjectEmpty || isContentEmpty || isAnyVariableUnset;

  const warningMessage = (() => {
    if (isSubjectEmpty || isContentEmpty) {
      return '발송하려면 메일 제목과 내용을 작성해 주세요.';
    }
    if (isAnyVariableUnset) {
      return '발송하려면 아직 작성되지 않은 변수를 모두 채워주세요.';
    }
    return null;
  })();

  return {
    isAnyVariableUnset,
    isContentEmpty,
    isSendDisabled,
    isSubjectEmpty,
    warningMessage,
  };
};
