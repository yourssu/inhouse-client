import { Divider } from '@yourssu-inhouse/interior';
import { Fragment } from 'react';

// TODO: API 연동 시 인터페이스 타입을 import 하는 것으로 변경
interface AnswerProps {
  answer: string;
  question: string;
  sectionId: number;
}

const Answer = ({ sectionId, question, answer }: AnswerProps) => {
  return (
    <div className="rounded-8 flex h-fit w-full flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <span className="bg-violet50 text-violet600 rounded-6 flex size-7 shrink-0 items-center justify-center self-start text-sm font-semibold">
          {sectionId}
        </span>
        <span className="text-neutralMuted text-17 font-semibold">{question}</span>
      </div>
      <p className="text-neutral pl-9 whitespace-pre-wrap">{answer}</p>
    </div>
  );
};

interface AnswerListProps {
  answers: AnswerProps[];
}

export const AnswerList = ({ answers }: AnswerListProps) => (
  <div className="flex flex-col">
    {answers.map((answer, index) => {
      const isFirst = index === 0;
      return (
        <Fragment key={index}>
          {!isFirst && <Divider />}
          <Answer {...answer} />
        </Fragment>
      );
    })}
  </div>
);
