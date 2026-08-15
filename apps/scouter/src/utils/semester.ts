export interface RecruitingSemester {
  term: number;
  year: number;
}

/**
 * 모집 학기를 YYYY-T 형식으로 변환해요.
 *
 * @example formatRecruitingSemester({ year: 2025, term: 2 }) // '2025-2'
 */
export const formatRecruitingSemester = ({ term, year }: RecruitingSemester) => `${year}-${term}`;

/**
 * N-M 형식의 학기 문자열을 'N학년 M학기'로 변환해요.
 */
export const formatSemester = (semester: string) => {
  const isCommonSemester = semester.match(/^(\d+)-(\d+)$/);
  if (isCommonSemester) {
    return `${isCommonSemester[1]}학년 ${isCommonSemester[2]}학기`;
  }
  return semester;
};
