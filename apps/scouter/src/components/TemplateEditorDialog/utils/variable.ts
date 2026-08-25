import { format } from 'date-fns';

import type { VariableItem } from '@/components/TemplateEditorDialog/type';

import { type DetailVariable, type VariableTypeName } from '@/apis/mails/schema';

export const isDefaultVariable = (type: VariableTypeName) =>
  type === 'APPLICANT' || type === 'PARTNAME';

export const toVariable = (detail: DetailVariable): VariableItem => ({
  id: detail.key.replace('var-', ''),
  name: detail.displayName,
  type: detail.type,
  isDefault: isDefaultVariable(detail.type),
  isDifferentPerPerson: detail.perRecipient,
  attributeKey: detail.attributeKey,
});

export const parseBodyHtml = (html: string, variables: VariableItem[]) => {
  return html.replace(/{{var-([a-zA-Z0-9-]+)}}/g, (match, uuid) => {
    const variable = variables.find((v) => v.id === uuid);
    if (!variable) {
      return match;
    }
    return `<span data-type="inlineVariable" id="${variable.id}" label="${variable.name}" isDifferentPerPerson="${
      variable.isDifferentPerPerson ?? false
    }"></span>`;
  });
};

// subject·body(직렬화된 {{var-...}} 형식)에서 실제로 참조된 변수 키(var-uuid)를 추출한다.
// 서버가 "사용되지 않는 변수" 선언을 거절하므로 제출 시 variables를 이 집합으로 필터링한다.
export const extractUsedVariableKeys = (...texts: string[]): Set<string> => {
  const keys = new Set<string>();
  for (const text of texts) {
    text.replace(/{{(var-[a-zA-Z0-9-]+)}}/g, (_, key: string) => {
      keys.add(key);
      return _;
    });
  }
  return keys;
};

export const toDetailVariable = ({
  id,
  name,
  type,
  isDifferentPerPerson,
  attributeKey,
}: VariableItem): DetailVariable => ({
  key: `var-${id}`,
  displayName: name,
  type,
  perRecipient: isDifferentPerPerson ?? false,
  attributeKey,
});

export const serializeBodyHtml = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const variables = doc.body.querySelectorAll('span[data-type="inlineVariable"]');

  variables.forEach((variable) => {
    const id = variable.getAttribute('id');
    if (id) {
      variable.replaceWith(`{{var-${id}}}`);
    }
  });

  return doc.body.innerHTML;
};

// subject는 plain text에 {{var-...}}로 변수를 표현한다.
// tiptap이 내보낸 HTML에서 칩 span을 {{var-...}}로 되돌리고, textContent로 디코딩해 plain text로 직렬화한다.
export const serializeSubject = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  doc.body.querySelectorAll('span[data-type="inlineVariable"]').forEach((variable) => {
    const id = variable.getAttribute('id');
    if (id) {
      variable.replaceWith(`{{var-${id}}}`);
    }
  });
  return doc.body.textContent ?? '';
};

export const renderSubject = (
  subject: string,
  variables: VariableItem[],
  variableValues: Record<string, any>,
  options: { partName?: string; recipientName?: string } = {},
) => {
  return subject.replace(/{{var-([a-zA-Z0-9-]+)}}/g, (match, id) => {
    const variable = variables.find((v) => v.id === id);
    if (!variable) {
      return match;
    }

    if (variable.isDefault) {
      if (variable.type === 'APPLICANT') {
        return options.recipientName ?? match;
      }
      if (variable.type === 'PARTNAME') {
        return options.partName ?? match;
      }
    }

    const key =
      variable.isDifferentPerPerson && options.recipientName
        ? `${id}_${options.recipientName}`
        : id;
    const value = variableValues[key];

    if (value instanceof Date) {
      return format(value, 'yyyy년 MM월 dd일');
    }
    if (variable.type === 'LINK' && value && typeof value === 'object') {
      return (value as { url?: string }).url ?? match;
    }
    return value ? String(value) : match;
  });
};

// 미리보기에서 subject의 {{var-...}}를 본문과 동일한 변수 칩 HTML로 렌더링한다.
// 해결된 값은 값으로, 미설정 변수는 "채우기: 이름" 칩으로 표시한다.
export const renderSubjectHtml = (
  subject: string,
  variables: VariableItem[],
  variableValues: Record<string, any>,
  options: { partName?: string; recipientName?: string } = {},
) => {
  return renderBodyHtml(parseBodyHtml(subject, variables), variables, variableValues, options);
};

export const renderBodyHtml = (
  html: string,
  variables: VariableItem[],
  variableValues: Record<string, any>,
  options: { partName?: string; recipientName?: string } = {},
) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const variableSpans = doc.body.querySelectorAll('span[data-type="inlineVariable"]');

  variableSpans.forEach((span) => {
    const id = span.getAttribute('id');
    const variable = variables.find((v) => v.id === id);
    const displayName = variable?.name ?? span.getAttribute('label') ?? '알 수 없는 변수';

    let isResolved = false;
    let valueStr = '';

    if (id && variable) {
      if (variable.isDefault) {
        if (variable.type === 'APPLICANT') {
          if (options.recipientName) {
            valueStr = options.recipientName;
            isResolved = true;
          }
        } else if (variable.type === 'PARTNAME') {
          if (options.partName) {
            valueStr = options.partName;
            isResolved = true;
          }
        }
      } else {
        const key =
          variable.isDifferentPerPerson && options.recipientName
            ? `${id}_${options.recipientName}`
            : id;
        const value = variableValues[key];

        if (value) {
          if (value instanceof Date) {
            valueStr = format(value, 'yyyy년 MM월 dd일');
            isResolved = true;
          } else if (variable.type !== 'LINK') {
            valueStr = String(value);
            isResolved = true;
          }
        }
      }
    }

    if (variable?.type === 'LINK') {
      const key =
        variable.isDifferentPerPerson && options.recipientName
          ? `${id}_${options.recipientName}`
          : id;
      const linkValue = key ? variableValues[key] : undefined;

      if (linkValue && typeof linkValue === 'object' && linkValue.url) {
        const a = doc.createElement('a');
        a.href = linkValue.url.startsWith('http') ? linkValue.url : `https://${linkValue.url}`;
        a.target = '_blank';
        a.rel = 'noreferrer noopener';
        a.style.color = '#3182F6';
        a.style.textDecoration = 'underline';
        a.style.wordBreak = 'break-all';
        a.textContent = linkValue.text || linkValue.url;
        span.replaceWith(a);
        return;
      }
    }

    if (!isResolved) {
      const chip = doc.createElement('span');
      const isDifferent =
        variable?.isDifferentPerPerson ?? span.getAttribute('isDifferentPerPerson') === 'true';
      chip.className = `inline-flex items-center px-1.5 rounded-md ${
        isDifferent ? 'bg-teal50 text-teal600' : 'bg-violetOpacity50 text-violet600'
      } font-medium mx-0.5 text-sm cursor-pointer hover:opacity-80 transition-opacity`;
      chip.setAttribute('data-type', 'inlineVariable');
      if (variable?.type) {
        chip.setAttribute('data-variable-type', variable.type);
      }
      chip.textContent = `채우기: ${displayName}`;
      span.replaceWith(chip);
      return;
    }

    span.replaceWith(valueStr);
  });

  doc.body.querySelectorAll('div').forEach((div) => {
    if (!div.hasChildNodes() || div.innerHTML.trim() === '') {
      div.appendChild(doc.createElement('br'));
    }
  });

  return doc.body.innerHTML;
};
