import { api } from '@/apis/api';

export interface DeletePartInterviewRubricParams {
  partId: number;
  semester: string;
}

export const deleteApplicantEvaluations = async (applicantId: number) => {
  await api.delete(`internal/dev/applicants/${applicantId}/evaluations`);
};

export const deleteApplicantDocumentEvaluations = async (applicantId: number) => {
  await api.delete(`internal/dev/applicants/${applicantId}/evaluations/documents`);
};

export const deleteApplicantInterviewEvaluations = async (applicantId: number) => {
  await api.delete(`internal/dev/applicants/${applicantId}/evaluations/interviews`);
};

export const resetPartDocumentRubricMaxScores = async (partId: number) => {
  await api.patch(`internal/dev/parts/${partId}/documents/rubrics/reset-max-scores`);
};

export const deletePartInterviewRubric = async ({
  partId,
  semester,
}: DeletePartInterviewRubricParams) => {
  await api.delete(`internal/dev/parts/${partId}/interviews/rubrics/${semester}`);
};
