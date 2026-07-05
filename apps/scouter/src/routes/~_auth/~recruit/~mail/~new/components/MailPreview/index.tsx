import { Lottie } from '@toss/lottie';
import { Result } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';

import type { ApplicantType } from '@/apis/applicants/schema';
import type { VariableTypeName } from '@/apis/mails/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';

import { MailPreviewPaper } from '@/routes/~_auth/~recruit/~mail/~new/components/MailPreview/MailPreviewPaper';

interface MailPreviewProps {
  applicants: ApplicantType[];
  formData: TemplateFormData;
  onVariableClick?: (type: VariableTypeName) => void;
}

export const MailPreview = ({ formData, applicants, onVariableClick }: MailPreviewProps) => {
  const applicantNames = applicants.map((a) => a.name);

  const hasContent = Boolean(formData.title.trim() || formData.content.trim());
  const hasApplicants = applicantNames.length > 0;
  const isValidToPreview = hasContent && hasApplicants;

  const resultData = hasContent ? resultContent.noRecipient : resultContent.noContent;

  return (
    <div className="flex size-full flex-col">
      {isValidToPreview ? (
        <MailPreviewPaper
          applicantNames={applicantNames}
          formData={formData}
          onVariableClick={onVariableClick}
        />
      ) : (
        <div className="flex h-full items-center justify-center pb-16">
          <Result
            description={resultData.description}
            figure={<Lottie className="size-30" delay={0.2} json={lotties.leftArrow} />}
            title={resultData.title}
          />
        </div>
      )}
    </div>
  );
};

const resultContent = {
  noRecipient: {
    description: undefined,
    title: '받는 사람을 추가해주세요',
  },
  noContent: {
    description: '또는 템플릿으로 시작해보세요.',
    title: '왼쪽 에디터에서 내용을 작성해보세요',
  },
} as const satisfies Record<string, { description?: string; title: string }>;
