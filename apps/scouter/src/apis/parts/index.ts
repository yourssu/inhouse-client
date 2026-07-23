import { api } from '@/apis/api';
import {
  PartDocumentsRubricsSchema,
  PartSchema,
  type UpdatePartDocumentRubricsRequestType,
} from '@/apis/parts/schema';

export const getParts = async () => {
  const response = await api.get('parts').json();
  return PartSchema.array().parse(response);
};

export const getPartDocumentsRubrics = async (partId: number) => {
  const res = await api.get(`parts/${partId}/documents/rubrics`).json();
  return PartDocumentsRubricsSchema.parse(res);
};

type PutPartDocumentRubricsParams = {
  data: UpdatePartDocumentRubricsRequestType;
  partId: number;
};

export const putPartDocumentsRubrics = async ({ partId, data }: PutPartDocumentRubricsParams) => {
  await api.put(`parts/${partId}/documents/rubrics`, { json: data });
};
