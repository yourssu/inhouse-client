import type { QuestionRequirement } from '@/apis/interviews/questions/schema';

interface BaseQuestionFormValue {
  assignedMemberId?: number;
  content: string;
}

export interface SourceQuestionFormValue extends BaseQuestionFormValue {
  sourceQuestionId?: number;
}

export interface CultureQuestionFormValue extends SourceQuestionFormValue {
  isSelected?: boolean;
  requirements: QuestionRequirement[];
}

export interface PartPersonalQuestionFormValue extends BaseQuestionFormValue {
  requirementIds: number[];
}

export interface PartQuestionFormValue extends PartPersonalQuestionFormValue {
  sourceQuestionId?: number;
}

export interface QuestionnaireFormValues {
  CULTURE: CultureQuestionFormValue[];
  INTRO: SourceQuestionFormValue[];
  OUTRO: SourceQuestionFormValue[];
  PART: PartQuestionFormValue[];
  PERSONAL: PartPersonalQuestionFormValue[];
}
