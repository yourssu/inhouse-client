import { http, HttpResponse } from 'msw';

import type { PartDocumentRubricsType, PartType } from '@/apis/parts/schema';

import { config } from '@/config';

// mocks/applicants.ts의 mockApplicant.part('Frontend')와 맞춰요.
export const mockParts: PartType[] = [{ partId: 1, partName: 'Frontend' }];

// mocks/applicants.ts의 mockDocumentAnswers 4문항과 짝을 맞춘 rubric이에요.
export const mockRubrics: PartDocumentRubricsType = [
  {
    sectionId: 1,
    question: 'Yourssu에 지원하게 된 동기를 작성해주세요.',
    maxScore: 20,
    criterionDetail: '지원 동기의 구체성과 진정성',
  },
  {
    sectionId: 2,
    question: '본인의 강점과 이를 활용한 경험을 작성해주세요.',
    maxScore: 30,
    criterionDetail: '강점과 경험의 연결성, 성장 가능성',
  },
  {
    sectionId: 3,
    question: '함께 활동하고 싶은 이유를 작성해주세요.',
    maxScore: 30,
    criterionDetail: '협업 지향성과 팀 기여 의지',
  },
  {
    sectionId: 4,
    question: 'Yourssu에서 가장 중요하다고 여기는 가치는 무엇인지 작성해주세요.',
    maxScore: 20,
    criterionDetail: '가치관과 조직 문화 적합성',
  },
];

export const handlers = [
  http.get(`${config.apiBaseURL}/parts`, () => {
    return HttpResponse.json(mockParts);
  }),

  http.get(`${config.apiBaseURL}/parts/:partId/documents/rubrics`, () => {
    return HttpResponse.json(mockRubrics);
  }),
];
