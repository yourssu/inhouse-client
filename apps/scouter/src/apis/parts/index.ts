import { getParts as getGeneratedParts } from '@/apis/generated/parts/client';
import { PartSchema } from '@/apis/parts/schema';

export const getParts = async () => {
  const { data } = await getGeneratedParts();
  return PartSchema.array().parse(data);
};
