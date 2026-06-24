import { SegmentedControl } from '@yourssu-inhouse/interior';
import { Tab } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { useState } from 'react';

import type { VariableTypeName } from '@/apis/mails/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';

import { Paper } from '@/components/Paper';
import { renderBodyHtml } from '@/components/TemplateEditorDialog/utils/variable';
import { MailPreviewContent } from '@/routes/~_auth/~recruit/~mail/~new/components/MailPreview/MailPreviewContent';
import { useVariableContext } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/context';
import { useMailSelectionContext } from '@/routes/~_auth/~recruit/~mail/~new/context';

interface MailPreviewPaperProps {
  applicantNames: string[];
  formData: TemplateFormData;
  onVariableClick?: (type: VariableTypeName) => void;
}

export const MailPreviewPaper = ({
  formData,
  applicantNames,
  onVariableClick,
}: MailPreviewPaperProps) => {
  const { variableValues } = useVariableContext();
  const { mailSelection } = useMailSelectionContext();
  const [provider, setProvider] = useState<'Gmail' | 'Naver'>('Gmail');

  return (
    <Paper className="min-h-0 flex-[1_1_0] flex-col p-6 pt-3.5">
      <Tab
        className="min-h-0 flex-1"
        right={
          <SegmentedControl
            items={['Gmail', 'Naver']}
            onValueChange={setProvider}
            value={provider}
          />
        }
        tabs={applicantNames}
      >
        {({ tab }) => {
          const currentHtml = renderBodyHtml(formData.content, formData.variables, variableValues, {
            recipientName: tab,
            partName: mailSelection.partName ?? undefined,
          });

          return (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pt-6 pr-2">
                {formData.title.trim() !== '' && (
                  <h2 className="text-lg font-semibold">{formData.title}</h2>
                )}

                <div
                  className={cn(
                    provider === 'Gmail' &&
                      '[&_div]:font-[Arial,Helvetica,sans-serif] [&_div]:leading-normal [&_p]:my-[13px] [&_p]:font-[Arial,Helvetica,sans-serif] [&_p]:leading-normal',
                    provider === 'Naver' && '[&_div]:leading-normal [&_p]:leading-normal',
                  )}
                >
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
