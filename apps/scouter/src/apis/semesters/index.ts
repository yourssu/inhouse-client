import { api } from '@/apis/api';
import { SemesterSchema } from '@/apis/semesters/schema';

export const getSemesters = async () => {
  const response = await api.get('semesters').json();
  return SemesterSchema.array().parse(response);
};

export const getSemestersNow = async () => {
  const response = await api.get('semesters/now').json();
  return SemesterSchema.parse(response);
};
