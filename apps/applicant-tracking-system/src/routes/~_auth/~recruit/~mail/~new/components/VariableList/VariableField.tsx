import type { ChangeEvent } from 'react';

import { josa } from 'es-hangul';

import type { VariableItem } from '@/components/TemplateEditorDialog/type';

import { DatePicker } from '@/components/_ui/DatePicker';
import { Fieldset } from '@/components/_ui/Fieldset';
import { Select } from '@/components/_ui/Select';
import { TextField } from '@/components/_ui/TextField';
import { useVariableContext } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/context';
import { isLinkValue } from '@/routes/~_auth/~recruit/~mail/~new/components/VariableList/type';

interface VariableFieldProps {
  disabled?: boolean;
  memberNames: string[];
  variable: VariableItem;
  variableKey: string;
}

export const VariableField = ({
  variable,
  memberNames,
  disabled,
  variableKey,
}: VariableFieldProps) => {
  const { variableValues, setVariableValue } = useVariableContext();
  const value = variableValues[variableKey] ?? undefined;

  switch (variable.type) {
    case 'APPLICANT':
      return (
        <TextField
          disabled={disabled}
          label={variable.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setVariableValue(variableKey, e.target.value)
          }
          placeholder={variable.name}
          size="lg"
          value={typeof value === 'string' ? value : ''}
          variant="outline"
        />
      );
    case 'DATE':
      return (
        <Fieldset label={variable.name}>
          <DatePicker
            className="w-full"
            disabled={disabled}
            onChange={(date) => setVariableValue(variableKey, date)}
            size="lg"
            value={value instanceof Date ? value : null}
            variant="outline"
          />
        </Fieldset>
      );
    case 'LINK': {
      const linkValue = isLinkValue(value) ? value : {};
      return (
        <Fieldset label={variable.name}>
          <div className="flex flex-col gap-2">
            <TextField
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setVariableValue(variableKey, { ...linkValue, text: e.target.value })
              }
              placeholder="링크 텍스트를 입력해주세요 (선택)"
              size="lg"
              value={linkValue.text ?? ''}
              variant="outline"
            />
            <TextField
              disabled={disabled}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setVariableValue(variableKey, { ...linkValue, url: e.target.value })
              }
              placeholder="URL을 입력해주세요"
              size="lg"
              value={linkValue.url ?? ''}
              variant="outline"
            />
          </div>
        </Fieldset>
      );
    }
    case 'PERSON':
      return (
        <Select
          className="w-full"
          disabled={disabled}
          items={memberNames}
          label={variable.name}
          onValueChange={(val) => setVariableValue(variableKey, val)}
          placeholder="멤버를 선택해주세요"
          size="lg"
          value={typeof value === 'string' ? value : ''}
          variant="outline"
        />
      );
    case 'TEXT':
      return (
        <TextField
          disabled={disabled}
          label={variable.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setVariableValue(variableKey, e.target.value)
          }
          placeholder={`${josa(variable.name, '을/를')} 입력해주세요`}
          size="lg"
          value={typeof value === 'string' ? value : ''}
          variant="outline"
        />
      );
    default:
      return null;
  }
};
