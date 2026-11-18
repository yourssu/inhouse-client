import { pascalCase } from 'es-toolkit/string';

export const nameOperation = (route: string, verb: string) => {
  const segments = route.split('/').filter(Boolean);
  const resources = segments.filter((segment) => !segment.startsWith('${'));
  const parameters = segments
    .filter((segment) => segment.startsWith('${'))
    .map((segment) => segment.slice(2, -1));

  // applicants/{applicantId}처럼 변수 이름과 중복되는 첫 리소스만 생략합니다.
  if (
    resources.length > 1 &&
    segments[1]?.startsWith('${') &&
    parameters[0]?.toLowerCase().startsWith(resources[0].replace(/s$/, '').toLowerCase())
  ) {
    resources.shift();
  }

  const parameterName = parameters.length ? `By${parameters.map(pascalCase).join('And')}` : '';
  return `${verb}${resources.map(pascalCase).join('')}${parameterName}`;
};
