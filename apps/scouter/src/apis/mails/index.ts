import { isNil, omitBy } from 'es-toolkit';
import ky from 'ky';

import { api } from '@/apis/api';
import {
  type BaseMailFileType,
  MailFileConfirmResponseSchema,
  MailFilePresignResponseSchema,
  type MailFileUsageType,
  type MailReservationGroupsResponse,
  MailReservationGroupsResponseSchema,
  type MailReservationListResponse,
  MailReservationListResponseSchema,
  type MailReservationStatusResponse,
  MailReservationStatusResponseSchema,
  type MailReserveRequest,
  type MailSendRequest,
  type MailTemplateDetail,
  MailTemplateDetailSchema,
  MailTemplatesResponseSchema,
  type SignedMailFileType,
} from '@/apis/mails/schema';
import { config } from '@/config';

export type GetMailTemplatesParams = {
  page?: number;
  size?: number;
  sort?: string; // NOTE: 값이 어떻게 정의되어 있는지 물어봐야 함
};

export type CreateMailTemplateRequest = Omit<
  MailTemplateDetail,
  'id' | 'inlineImageReferences' | 'updatedAt'
>;

export const getMailTemplates = async (params: GetMailTemplatesParams) => {
  const res = await api.get('api/mails/templates', { searchParams: omitBy(params, isNil) }).json();
  return MailTemplatesResponseSchema.parse(res);
};

export const getMailTemplateDetail = async (templateId: number) => {
  const res = await api.get(`api/mails/templates/${templateId}`).json();
  return MailTemplateDetailSchema.parse(res);
};

export const getMailFileSignedUrl = async (files: BaseMailFileType[]) => {
  const res = await api.post('api/mails/files/presign', { json: { files } }).json();
  return MailFilePresignResponseSchema.parse(res);
};

export const confirmMailFiles = async (files: SignedMailFileType[]) => {
  const res = await api.post('api/mails/files/confirm', { json: { files } }).json();
  return MailFileConfirmResponseSchema.parse(res);
};

export const uploadMailFiles = async (files: File[], usage: MailFileUsageType) => {
  const { uploads } = await getMailFileSignedUrl(
    files.map((file) => ({
      fileName: file.name,
      contentType: file.type,
      usage,
    })),
  );

  // TODO: getMailFilesSignedUrl의 요청 파일 인덱스가 실제 응답 파일 인덱스 일치 보장 여부 확인 필요
  await Promise.all(
    uploads.map(({ putUrl, contentType }, i) =>
      ky.put(putUrl, {
        body: files[i],
        headers: { 'Content-Type': contentType },
      }),
    ),
  );

  const { files: results } = await confirmMailFiles(
    uploads.map(({ cid, contentType }, i) => ({
      cid,
      fileName: files[i].name,
      contentType,
      usage,
    })),
  );
  return results;
};

export const toMailImageUrl = ({ cid }: { cid: string }) => {
  return `${config.s3ImageURL}/${encodeURIComponent(cid)}`;
};

export const createMailTemplate = async (data: CreateMailTemplateRequest) => {
  await api.post('api/mails/templates', { json: data });
};

export const updateMailTemplate = async ({
  templateId,
  data,
}: {
  data: CreateMailTemplateRequest;
  templateId: number;
}) => {
  await api.put(`api/mails/templates/${templateId}`, { json: data });
};

export const postMailReservation = async (data: MailReserveRequest) => {
  await api.post('api/mails/reservation', { json: data });
};

export const postMailSend = async (data: MailSendRequest) => {
  await api.post('api/mails/send', { json: data });
};

export const deleteMailTemplate = async (templateId: number) => {
  await api.delete(`api/mails/templates/${templateId}`);
};

export const getMailReservations = async (): Promise<MailReservationListResponse> => {
  const res = await api.get('api/mails/reservation').json();
  return MailReservationListResponseSchema.parse(res);
};

export const getMailReservationStatus = async (): Promise<MailReservationStatusResponse> => {
  const res = await api.get('api/mails/reservation/status').json();
  return MailReservationStatusResponseSchema.parse(res);
};

export const getMailReservationGroups = async (): Promise<MailReservationGroupsResponse> => {
  const res = await api.get('api/mails/reservation/groups').json();
  return MailReservationGroupsResponseSchema.parse(res);
};
