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
