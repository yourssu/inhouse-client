import type { PartNameType } from '@/apis/parts/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';
import type { VariableItem } from '@/components/TemplateEditorDialog/type';
import type { VariableValueType } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

import { renderBodyHtml } from '@/components/TemplateEditorDialog/utils/variable';

type BuildMailPayloadParams = {
  formData: TemplateFormData;
  partName: Exclude<PartNameType, 'Head lead'> | null;
  recipientName?: string;
  variableValues: Record<VariableItem['id'], VariableValueType>;
};

export const buildMailPayload = ({
  formData,
  variableValues,
  partName,
  recipientName,
}: BuildMailPayloadParams) => ({
  attachmentReferences: formData.attachments.map(({ fileId }) => ({ fileId })),
  bodyFormat: 'HTML' as const,
  mailBody: renderBodyHtml(formData.content, formData.variables, variableValues, {
    partName: partName ?? undefined,
    recipientName,
  }),
  mailSubject: formData.title,
});
