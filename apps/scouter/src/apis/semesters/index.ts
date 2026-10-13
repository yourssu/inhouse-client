import {
  getSemesters as getGeneratedSemesters,
  getSemestersNow as getGeneratedSemestersNow,
} from '@/apis/generated/semesters/client';
import { SemesterSchema } from '@/apis/semesters/schema';

export const getSemesters = async () => {
  const { data } = await getGeneratedSemesters();
  return SemesterSchema.array().parse(data);
};

export const getSemestersNow = async () => {
  const { data } = await getGeneratedSemestersNow();
  return SemesterSchema.parse(data);
};
