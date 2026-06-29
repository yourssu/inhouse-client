import { api } from '@/apis/api';
import { PartSchema } from '@/apis/parts/schema';

export const getParts = async () => {
  const response = await api.get('parts').json();
  return PartSchema.array().parse(response);
};
