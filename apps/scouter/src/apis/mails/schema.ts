import { z } from 'zod/v4';

export const MailTemplateSchema = z.object({
  id: z.number(),
  title: z.string(),
  updatedAt: z.iso.datetime(),
});

export const MailTemplatesResponseSchema = z.object({
  content: z.array(MailTemplateSchema),
  page: z.number(),
  size: z.number(),
  totalElements: z.number(),
  totalPages: z.number(),
});

export const fileUsageSchema = z.enum(['INLINE', 'ATTACHMENT']);

export const BaseMailFileSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  usage: fileUsageSchema,
});

export const MailFilePresignResponseSchema = z.object({
  uploads: z.array(
    z.object({
      cid: z.string(),
      putUrl: z.string(),
      expiresAt: z.iso.datetime(),
      contentType: z.string(),
    }),
  ),
});

export const SignedMailFileSchema = BaseMailFileSchema.extend({
  cid: z.string(),
});

export const ConfirmedMailFileSchema = SignedMailFileSchema.extend({
  fileId: z.number(),
  used: z.boolean(),
  createdAt: z.iso.datetime().optional(),
});

export const MailFileConfirmResponseSchema = z.object({
  files: z.array(ConfirmedMailFileSchema),
});

export const variableTypeNames = [
  'PERSON',
  'DATE',
  'LINK',
  'TEXT',
  'APPLICANT',
  'PARTNAME',
] as const;

export const DetailVariableSchema = z.object({
  key: z.string(),
  type: z.enum(variableTypeNames),
  displayName: z.string(),
  perRecipient: z.boolean(),
  // 스펙상 required가 아니라 서버가 null을 내려줄 수 있어 nullish로 받고 undefined로 정규화한다.
  attributeKey: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
});

export const AttachmentReferenceSchema = z.object({
  fileId: z.number().optional(),
  fileName: z.string(),
  contentType: z.string(),
  storageKey: z.string(),
});

export const MailTemplateDetailSchema = z.object({
  id: z.number(),
  title: z.string(),
  subject: z.string(),
  bodyHtml: z.string(),
  variables: z.array(DetailVariableSchema),
  attachmentReferences: z.array(AttachmentReferenceSchema),
  updatedAt: z.iso.datetime(),
});

export const AttachmentReferenceRequestSchema = z.object({
  fileId: z.number(),
});

export const CreateMailTemplateRequestSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  bodyHtml: z.string(),
  variables: z.array(DetailVariableSchema),
  attachmentReferences: z.array(AttachmentReferenceRequestSchema),
});

export const RecipientRequestSchema = z.object({
  email: z.email(),
  applicantId: z.number().optional(),
  bindings: z.record(z.string(), z.string()),
});

export const MailReserveRequestSchema = z.object({
  templateId: z.number(),
  reservationTime: z.iso.datetime(),
  recipients: z.array(RecipientRequestSchema),
  sharedBindings: z.record(z.string(), z.string()),
  ccEmailAddresses: z.array(z.email()).optional(),
  bccEmailAddresses: z.array(z.email()).optional(),
});

export const MailSendRequestSchema = z.object({
  receiverEmailAddresses: z.array(z.email()),
  mailSubject: z.string(),
  mailBody: z.string(),
  bodyFormat: z.enum(['HTML', 'PLAIN_TEXT']),
  attachmentReferences: z.array(AttachmentReferenceRequestSchema),
});

export const mailReservationStatus = ['SCHEDULED', 'PENDING_SEND', 'SENDING', 'SENT'] as const;

export const MailReservationItemSchema = z.object({
  reservationId: z.number(),
  reservationTime: z.iso.datetime(),
  status: z.enum(mailReservationStatus),
  senderEmailAddress: z.string(),
  mailSubject: z.string(),
  primaryReceiverEmailAddress: z.string().nullable(),
  attachmentReferences: z.array(AttachmentReferenceSchema),
});

export const MailReservationListResponseSchema = z.object({
  items: z.array(MailReservationItemSchema),
});

export const MailReservationStatusItemSchema = z.object({
  reservationId: z.number(),
  reservationTime: z.iso.datetime(),
  failureErrorCode: z.string().optional(),
  failedAt: z.iso.datetime().optional(),
});

export const MailReservationStatusResponseSchema = z.object({
  items: z.array(MailReservationStatusItemSchema),
});

export const MailReservationGroupsGroupSchema = z.object({
  groupId: z.number(),
  reserverName: z.string(),
  reserverEmail: z.string(),
  templateId: z.number(),
  reservationTime: z.iso.datetime(),
  status: z.enum(mailReservationStatus),
  createdAt: z.iso.datetime(),
  mails: z.array(
    z.object({
      reservationId: z.number(),
      receiverEmail: z.string(),
      mailSubject: z.string(),
    }),
  ),
});

export const MailReservationGroupsResponseSchema = z.object({
  groups: z.array(MailReservationGroupsGroupSchema),
});

export type MailFileUsageType = z.infer<typeof fileUsageSchema>;
export type BaseMailFileType = z.infer<typeof BaseMailFileSchema>;
export type SignedMailFileType = z.infer<typeof SignedMailFileSchema>;
export type ConfirmedMailFileType = z.infer<typeof ConfirmedMailFileSchema>;
export type MailFilePresignResponse = z.infer<typeof MailFilePresignResponseSchema>;
export type MailFileConfirmResponse = z.infer<typeof MailFileConfirmResponseSchema>;
export type VariableTypeName = (typeof variableTypeNames)[number];
export type DetailVariable = z.infer<typeof DetailVariableSchema>;
export type AttachmentReference = z.infer<typeof AttachmentReferenceSchema>;
export type MailTemplateDetail = z.infer<typeof MailTemplateDetailSchema>;
export type MailTemplateType = z.infer<typeof MailTemplateSchema>;
export type MailTemplatesResponse = z.infer<typeof MailTemplatesResponseSchema>;
export type MailReserveRequest = z.infer<typeof MailReserveRequestSchema>;
export type MailSendRequest = z.infer<typeof MailSendRequestSchema>;
export type AttachmentReferenceRequest = z.infer<typeof AttachmentReferenceRequestSchema>;
export type CreateMailTemplateRequest = z.infer<typeof CreateMailTemplateRequestSchema>;
export type RecipientRequest = z.infer<typeof RecipientRequestSchema>;
export type MailReservationStatusType = (typeof mailReservationStatus)[number];
export type MailReservationItem = z.infer<typeof MailReservationItemSchema>;
export type MailReservationListResponse = z.infer<typeof MailReservationListResponseSchema>;
export type MailReservationStatusItem = z.infer<typeof MailReservationStatusItemSchema>;
export type MailReservationStatusResponse = z.infer<typeof MailReservationStatusResponseSchema>;
export type MailReservationGroupsResponse = z.infer<typeof MailReservationGroupsResponseSchema>;
