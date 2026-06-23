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

export const toDetailVariable = ({
  id,
  name,
  type,
  isDifferentPerPerson,
}: VariableItem): DetailVariable => ({
  key: `var-${id}`,
  displayName: name,
  type,
  perRecipient: isDifferentPerPerson ?? false,
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
