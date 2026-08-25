import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { VariableItem } from '@/components/TemplateEditorDialog/type';

import {
  type AttachmentReference,
  type DetailVariable,
  type MailTemplateDetail,
} from '@/apis/mails/schema';
import { parseBodyHtml, toVariable } from '@/components/TemplateEditorDialog/utils/variable';

export interface TemplateFormData {
  attachments: AttachmentReference[];
  content: string;
  subject: string;
  title: string;
  variables: VariableItem[];
}

const defaultFormData: TemplateFormData = {
  title: '',
  subject: '',
  content: '',
  variables: [
    { name: '파트명', id: uuidv4(), type: 'PARTNAME', isDefault: true },
    {
      name: '지원자',
      id: uuidv4(),
      type: 'APPLICANT',
      isDefault: true,
      isDifferentPerPerson: true,
      attributeKey: 'applicant.name',
    },
  ],
  attachments: [],
};

export const transformDetailToFormData = (initialData: MailTemplateDetail): TemplateFormData => {
  const replaceDefaultVariablesAsInitial = (variables: DetailVariable[]) => {
    const initialVariables = variables.map(toVariable);
    const defaults = defaultFormData.variables.map((defaultVar) => {
      const match = initialVariables.find((v) => v.type === defaultVar.type && v.isDefault);
      return match ?? defaultVar;
    });

    const defaultIds = defaults.map((v) => v.id);
    const others = initialVariables.filter((v) => !defaultIds.includes(v.id));

    return [...defaults, ...others];
  };

  const { attachmentReferences, bodyHtml, subject, title, variables } = initialData;
  const initialVariables = replaceDefaultVariablesAsInitial(variables);
  return {
    title,
    subject,
    content: parseBodyHtml(bodyHtml, initialVariables),
    variables: initialVariables,
    attachments: attachmentReferences,
  };
};

export const useTemplateFormData = (initialData?: MailTemplateDetail) => {
  const [formData, setFormData] = useState<TemplateFormData>(() => {
    if (!initialData) {
      return defaultFormData;
    }
    return transformDetailToFormData(initialData);
  });

  return [formData, setFormData] as const;
};
