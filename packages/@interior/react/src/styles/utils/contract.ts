export const interiorContract = (v: null | string) => {
  if (!v) {
    throw Error('변수가 없어요.');
  }
  const name = v.match(/^var\(([^,)]+)(?:,\s*.+)?\)$/)?.[1].trim();
  if (!name) {
    throw Error(`올바르지 않은 변수 이름이에요: ${v}`);
  }
  return name;
};
