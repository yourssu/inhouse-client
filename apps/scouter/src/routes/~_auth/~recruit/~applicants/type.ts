import { pick } from 'es-toolkit';

import { applicantStateKo } from '@/types/applicants';

export const applicantTabNameKo = pick(applicantStateKo, [
  'UNDER_REVIEW',
  'DOCUMENT_REJECTED',
  'INTERVIEW_REJECTED',
  'INCUBATING_REJECTED',
  'FINAL_ACCEPTED',
]);

export type ApplicantTabNameType = keyof typeof applicantTabNameKo;
