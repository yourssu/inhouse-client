import { getMonth, getYear, parseISO } from 'date-fns';

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
 * 지원일을 기준으로 리쿠르팅 학기를 추론해요.
 *
 * NOTE: 학기 레코드(`/semesters`)엔 날짜 범위가 없고, 지원자 조회 응답에도 리쿠르팅 학기
 * 필드가 없어서 정확한 값을 서버에서 받아올 방법이 없어요. 7월을 기준으로
 * 상반기(1학기)/하반기(2학기)를 나누는 걸로 추정한 값이라, 실제 리쿠르팅 일정과
 * 어긋나는 지원자가 나오면 이 경계부터 의심해 주세요.
 *
 * @example inferRecruitingSemesterFromApplicationDate('2026-03-15') // { year: 2026, term: 1 }
 * @example inferRecruitingSemesterFromApplicationDate('2026-08-20') // { year: 2026, term: 2 }
 */
export const inferRecruitingSemesterFromApplicationDate = (
  applicationDate: string,
): RecruitingSemester => {
  const date = parseISO(applicationDate);
  return {
    year: getYear(date),
    term: getMonth(date) < 6 ? 1 : 2, // getMonth()는 0(1월)부터 시작해서 6이 7월
  };
};

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
