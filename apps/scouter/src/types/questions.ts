import type { QuestionCategory } from '@/apis/interviews/questions/schema';

export const questionCategoryKo = {
  INTRO: '인트로 필수 질문',
  OUTRO: '아웃트로 필수 질문',
  CULTURE: '컬처핏 질문',
  PART: '파트 공통 질문',
  PERSONAL: '지원자 개인 질문',
} as const satisfies Record<QuestionCategory, string>;
