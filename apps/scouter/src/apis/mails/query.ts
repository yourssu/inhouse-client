import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import type { MailTemplatesResponse } from '@/apis/mails/schema';

import {
  getMailReservations,
  getMailTemplateDetail,
  getMailTemplates,
  type GetMailTemplatesParams,
} from '@/apis/mails';

const qk = pluginQueryKey('scouter');

export const mailTemplatesInfiniteOption = (params: Omit<GetMailTemplatesParams, 'page'> = {}) =>
  infiniteQueryOptions({
    getNextPageParam: (lastPage: MailTemplatesResponse) => {
      if (lastPage.page < lastPage.totalPages - 1) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
    queryKey: qk.for('mails', 'templates', params),
    queryFn: ({ pageParam }) => getMailTemplates({ ...params, page: pageParam }),
  });

export const mailTemplatesOption = (params: GetMailTemplatesParams = {}) =>
  queryOptions({
    queryKey: qk.for('mails', 'templates', params),
    queryFn: () => getMailTemplates(params),
  });

export const mailTemplateDetailOption = (templateId: number) =>
  queryOptions({
    queryKey: qk.for('mails', 'templates', templateId),
    queryFn: () => getMailTemplateDetail(templateId),
  });

export const mailReservationsOption = () =>
  queryOptions({
    queryKey: qk.for('mails', 'reservations'),
    queryFn: () => getMailReservations(),
  });
