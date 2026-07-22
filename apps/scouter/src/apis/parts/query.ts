import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import { getPartDocumentsRubrics, getParts } from '@/apis/parts';

const qk = pluginQueryKey('scouter');

export const partsOption = () =>
  queryOptions({
    queryKey: qk.for('parts'),
    queryFn: () => getParts(),
    staleTime: Infinity,
  });

export const getPartDocumentsRubricsOption = (partId: number) =>
  queryOptions({
    queryKey: qk.for('parts', partId, 'documents', 'rubrics'),
    queryFn: () => getPartDocumentsRubrics(partId),
  });
