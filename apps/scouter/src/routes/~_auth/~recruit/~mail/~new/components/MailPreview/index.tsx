import { Lottie } from '@toss/lottie';
import { lotties } from '@yourssu-inhouse/resources';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { VariableTypeName } from '@/apis/mails/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';

import { MailPreviewPaper } from '@/routes/~_auth/~recruit/~mail/~new/components/MailPreview/MailPreviewPaper';

interface MailPreviewProps {
  applicants: ApplicantType[];
  formData: TemplateFormData;
  loadTemplateLoading: boolean;
  onLoadTemplate: () => void;
  onVariableClick?: (type: VariableTypeName) => void;
}

export const MailPreview = ({
  formData,
  applicants,
  loadTemplateLoading,
  onLoadTemplate,
  onVariableClick,
}: MailPreviewProps) => {
  const applicantNames = applicants.map((a) => a.name);

  const hasContent = Boolean(formData.subject.trim() || formData.content.trim());
  const hasApplicants = applicantNames.length > 0;
  const isValidToPreview = hasContent && hasApplicants;

  return (
    <div className="flex size-full flex-col">
      {isValidToPreview ? (
        <MailPreviewPaper
          applicantNames={applicantNames}
          formData={formData}
          loadTemplateLoading={loadTemplateLoading}
          onLoadTemplate={onLoadTemplate}
          onVariableClick={onVariableClick}
        />
      ) : (
        <div className="flex h-full flex-[1_1_0] flex-col items-center pb-16">
          <Lottie autoPlay className="size-30 rotate-180" delay={100} json={lotties.leftArrow} />
          <div className="text-neutralMuted text-center text-lg font-medium whitespace-pre-wrap">
            {'오른쪽 패널에서\n받는 사람을 선택해주세요.'}
          </div>
        </div>
      )}
    </div>
  );
};
