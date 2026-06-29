import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import type { MailTemplatesResponse } from '@/apis/mails/schema';

import {
  getMailReservations,
  getMailTemplateDetail,
  getMailTemplates,
  type GetMailTemplatesParams,
} from '@/apis/mails';

export const mailTemplatesInfiniteOption = (params: Omit<GetMailTemplatesParams, 'page'> = {}) => {
  const queryKey = ['mails', 'templates', params];

  return infiniteQueryOptions({
    getNextPageParam: (lastPage: MailTemplatesResponse) => {
      if (lastPage.page < lastPage.totalPages - 1) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    queryKey,
    queryFn: ({ pageParam }) => getMailTemplates({ ...params, page: pageParam }),
  });
};

export const mailTemplatesOption = (params: GetMailTemplatesParams = {}) => {
  const queryKey = ['mails', 'templates', params];

  return queryOptions({
    queryKey,
    queryFn: () => getMailTemplates(params),
  });
};

export const mailTemplateDetailOption = (templateId: number) => {
  return queryOptions({
    queryKey: ['mails', 'templates', templateId],
    queryFn: () => getMailTemplateDetail(templateId),
  });
};

export const mailReservationsOption = () => {
  return queryOptions({
    queryKey: ['mails', 'reservations'],
    queryFn: () => getMailReservations(),
  });
};
