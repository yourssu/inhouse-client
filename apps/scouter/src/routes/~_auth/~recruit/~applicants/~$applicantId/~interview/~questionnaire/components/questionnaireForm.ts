import type { QuestionRequirement } from '@/apis/interviews/questions/schema';

interface BaseQuestionFormValue {
  assignedInterviewerUserId?: number;
  content: string;
}

export interface GlobalQuestionFormValue extends BaseQuestionFormValue {
  sourceQuestionId?: number;
}

export interface CultureQuestionFormValue extends GlobalQuestionFormValue {
  isSelected?: boolean;
  requirements: QuestionRequirement[];
}

export interface PartPersonalQuestionFormValue extends BaseQuestionFormValue {
  requirementIds: number[];
}

export interface QuestionnaireFormValues {
  CULTURE: CultureQuestionFormValue[];
  GLOBAL: GlobalQuestionFormValue[];
  PART: PartPersonalQuestionFormValue[];
  PERSONAL: PartPersonalQuestionFormValue[];
}
