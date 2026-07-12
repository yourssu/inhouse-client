const sameStrings = (left, right) =>
  Array.isArray(left) &&
  Array.isArray(right) &&
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

export const validateGradingData = ({ grading, expectedTexts, label }) => {
  const errors = [];
  if (!grading || !Array.isArray(grading.expectations)) {
    return {
      errors: [`${label}: expectations 배열이 없습니다.`],
      computed: null,
    };
  }

  const actualTexts = grading.expectations.map((expectation) => expectation?.text);
  if (!sameStrings(actualTexts, expectedTexts)) {
    errors.push(`${label}: expectation 원문 또는 순서가 다릅니다.`);
  }
  if (
    grading.expectations.some(
      (expectation) =>
        !expectation ||
        typeof expectation.passed !== 'boolean' ||
        typeof expectation.evidence !== 'string' ||
        expectation.evidence.trim().length === 0,
    )
  ) {
    errors.push(`${label}: passed 또는 evidence가 올바르지 않습니다.`);
  }

  const passed = grading.expectations.filter((expectation) => expectation?.passed === true).length;
  const total = grading.expectations.length;
  const computed = {
    passed,
    failed: total - passed,
    total,
    pass_rate: total === 0 ? 0 : passed / total,
  };
  const summary = grading.summary;
  if (
    !summary ||
    summary.passed !== computed.passed ||
    summary.failed !== computed.failed ||
    summary.total !== computed.total ||
    typeof summary.pass_rate !== 'number' ||
    !Number.isFinite(summary.pass_rate) ||
    Math.abs(summary.pass_rate - computed.pass_rate) > 1e-9
  ) {
    errors.push(`${label}: summary 계산이 expectation과 다릅니다.`);
  }

  return { errors, computed };
};