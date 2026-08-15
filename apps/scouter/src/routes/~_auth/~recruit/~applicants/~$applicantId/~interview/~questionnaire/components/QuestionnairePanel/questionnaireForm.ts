import type { QuestionRequirement } from '@/apis/interviews/questions/schema';

interface BaseQuestionFormValue {
  assignedInterviewerUserId?: number;
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

export interface QuestionnaireFormValues {
  CULTURE: CultureQuestionFormValue[];
  INTRO: SourceQuestionFormValue[];
  OUTRO: SourceQuestionFormValue[];
  PART: PartPersonalQuestionFormValue[];
  PERSONAL: PartPersonalQuestionFormValue[];
}
