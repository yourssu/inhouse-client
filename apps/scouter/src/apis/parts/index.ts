import { api } from '@/apis/api';
import { PartDocumentsRubricsSchema, PartSchema } from '@/apis/parts/schema';

export const getParts = async () => {
  const response = await api.get('parts').json();
  return PartSchema.array().parse(response);
};

export const getPartDocumentsRubrics = async (partId: number) => {
  const res = await api.get(`parts/${partId}/documents/rubrics`).json();
  return PartDocumentsRubricsSchema.parse(res);
};
