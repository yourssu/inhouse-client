import type { ApplicantType } from '@/apis/applicants/schema';
import type { MailReserveRequest, MailSendRequest } from '@/apis/mails/schema';
import type { ActiveMemberType } from '@/apis/members/schema';
import type { PartNameType } from '@/apis/parts/schema';
import type { TemplateFormData } from '@/components/TemplateEditorDialog/hooks/useTemplateFormData';
import type { VariableItem } from '@/components/TemplateEditorDialog/type';
import type { VariableValueType } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

import { toAttachmentReferenceRequests } from '@/apis/mails';
import {
  isDefaultVariable,
  renderBodyHtml,
  renderSubject,
} from '@/components/TemplateEditorDialog/utils/variable';

const isLinkValue = (val: VariableValueType): val is { text?: string; url?: string } =>
  val != null && typeof val === 'object' && !(val instanceof Date);

// 바인딩은 Record<string, string> 이므로 변수 값을 문자열로 직렬화한다.
// DATE는 ISO 8601, LINK는 url 문자열, 그 외는 문자열 그대로. 미설정 값은 null.
const serializeBindingValue = (
  value: VariableValueType,
  type: VariableItem['type'],
): null | string => {
  if (value == null || value === '') {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (type === 'LINK') {
    return isLinkValue(value) ? (value.url ?? null) : null;
  }
  return String(value);
};

type BuildReservationPayloadParams = {
  bccMembers: ActiveMemberType[];
  receivers: ApplicantType[];
  reservationTime: string;
  templateId: number;
  variables: VariableItem[];
  variableValues: Record<string, VariableValueType>;
};

export const buildReservationPayload = ({
  templateId,
  reservationTime,
  receivers,
  bccMembers,
  variables,
  variableValues,
}: BuildReservationPayloadParams): MailReserveRequest => {
  // APPLICANT/PARTNAME은 서버가 자동 채움하므로 바인딩에서 제외한다.
  const userInputVariables = variables.filter((v) => !isDefaultVariable(v.type));
  const sharedVariables = userInputVariables.filter((v) => !v.isDifferentPerPerson);
  const perRecipientVariables = userInputVariables.filter((v) => v.isDifferentPerPerson);

  const sharedBindings: Record<string, string> = {};
  for (const variable of sharedVariables) {
    const serialized = serializeBindingValue(variableValues[variable.id], variable.type);
    if (serialized != null) {
      sharedBindings[`var-${variable.id}`] = serialized;
    }
  }

  const recipients = receivers.map((receiver) => {
    const bindings: Record<string, string> = {};
    for (const variable of perRecipientVariables) {
      const serialized = serializeBindingValue(
        variableValues[`${variable.id}_${receiver.name}`],
        variable.type,
      );
      if (serialized != null) {
        bindings[`var-${variable.id}`] = serialized;
      }
    }
    return {
      email: receiver.email,
      applicantId: receiver.applicantId,
      bindings,
    };
  });

  return {
    templateId,
    reservationTime,
    recipients,
    sharedBindings,
    bccEmailAddresses: bccMembers.map((m) => m.email),
  };
};

type BuildTestSendPayloadParams = {
  formData: TemplateFormData;
  partName: Exclude<PartNameType, 'Head lead'> | null;
  recipientName?: string;
  toEmail: string;
  variableValues: Record<VariableItem['id'], VariableValueType>;
};

export const buildTestSendPayload = ({
  formData,
  variableValues,
  partName,
  recipientName,
  toEmail,
}: BuildTestSendPayloadParams): MailSendRequest => ({
  receiverEmailAddresses: [toEmail],
  mailSubject: renderSubject(formData.subject, formData.variables, variableValues, {
    partName: partName ?? undefined,
    recipientName,
  }),
  mailBody: renderBodyHtml(formData.content, formData.variables, variableValues, {
    partName: partName ?? undefined,
    recipientName,
  }),
  bodyFormat: 'HTML' as const,
  attachmentReferences: toAttachmentReferenceRequests(formData.attachments),
});
