import { MdCalendarToday, MdLink, MdPerson, MdTextFields } from 'react-icons/md';

import type { VariableTypeName } from '@/apis/mails/schema';

export type VariablePannelStep = 'create' | 'list' | 'select';

export type SelectableVariableType = Exclude<VariableTypeName, 'APPLICANT' | 'PARTNAME'>;

export interface VariableItem {
  id: string;
  isDefault?: boolean;
  isDifferentPerPerson?: boolean;
  name: string;
  type: VariableTypeName;
}

export const variableIconMap = {
  DATE: <MdCalendarToday />,
  LINK: <MdLink />,
  PERSON: <MdPerson />,
  TEXT: <MdTextFields />,
  APPLICANT: <MdPerson />,
  PARTNAME: <MdTextFields />,
} as const satisfies Record<VariableTypeName, React.ReactNode>;
