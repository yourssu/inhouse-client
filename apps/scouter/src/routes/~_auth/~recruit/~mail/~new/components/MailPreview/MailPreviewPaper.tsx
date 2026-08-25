import { Button } from '@yourssu-inhouse/interior';
import { Tab } from '@yourssu-inhouse/interior';

import type { VariableTypeName } from '@/apis/mails/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';

import { Paper } from '@/components/Paper';
import {
  renderBodyHtml,
  renderSubjectHtml,
} from '@/components/TemplateEditorDialog/utils/variable';
import { MailPreviewContent } from '@/routes/~_auth/~recruit/~mail/~new/components/MailPreview/MailPreviewContent';
import { useVariableContext } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/context';
import { useMailSelectionContext } from '@/routes/~_auth/~recruit/~mail/~new/context';

interface MailPreviewPaperProps {
  applicantNames: string[];
  formData: TemplateFormData;
  loadTemplateLoading: boolean;
  onLoadTemplate: () => void;
  onVariableClick?: (type: VariableTypeName) => void;
}

export const MailPreviewPaper = ({
  formData,
  applicantNames,
  loadTemplateLoading,
  onLoadTemplate,
  onVariableClick,
}: MailPreviewPaperProps) => {
  const { variableValues } = useVariableContext();
  const { mailSelection } = useMailSelectionContext();

  return (
    <Paper className="min-h-0 flex-[1_1_0] flex-col p-6 pt-3.5">
      <Tab
        className="min-h-0 flex-1"
        right={
          <Button
            loading={loadTemplateLoading}
            onClick={onLoadTemplate}
            size="md"
            variant="secondary"
          >
            템플릿 불러오기
          </Button>
        }
        tabs={applicantNames}
      >
        {({ tab }) => {
          const currentHtml = renderBodyHtml(formData.content, formData.variables, variableValues, {
            recipientName: tab,
            partName: mailSelection.partName ?? undefined,
          });
          const currentSubjectHtml = renderSubjectHtml(
            formData.subject,
            formData.variables,
            variableValues,
            {
              recipientName: tab,
              partName: mailSelection.partName ?? undefined,
            },
          );

          return (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pt-6 pr-2">
                {formData.subject.trim() !== '' && (
                  <MailPreviewContent
                    className="text-lg font-semibold"
                    html={currentSubjectHtml}
                    onVariableClick={onVariableClick}
                  />
                )}

                <div className="[&_div]:font-[Arial,Helvetica,sans-serif] [&_div]:leading-normal [&_p]:my-[13px] [&_p]:font-[Arial,Helvetica,sans-serif] [&_p]:leading-normal">
                  <MailPreviewContent html={currentHtml} onVariableClick={onVariableClick} />
                </div>
              </div>

              {formData.attachments.length > 0 && (
                <div className="border-grey200 text-neutralSubtle mt-2 shrink-0 border-t pt-3">
                  <p className="text-13 mb-1.5">첨부파일 ({formData.attachments.length})</p>
                  <ul>
                    {formData.attachments.map((attachment) => (
                      <li className="text-sm" key={attachment.fileId}>
                        {attachment.fileName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        }}
      </Tab>
    </Paper>
  );
};
