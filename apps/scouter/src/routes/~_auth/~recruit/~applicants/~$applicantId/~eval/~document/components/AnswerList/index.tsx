import { Lottie } from '@toss/lottie';
import { Divider, Result } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { Fragment } from 'react';


// TODO: API 연동 시 인터페이스 타입을 import 하는 것으로 변경
interface AnswerProps {
  answer: string;
  question: string;
  section: number;
}

const Answer = ({ section, question, answer }: AnswerProps) => {
  return (
    <div className="rounded-8 flex h-fit w-full flex-col gap-3 p-5">
      <div className="flex items-center gap-2">
        <span className="bg-violet50 self-start text-violet600 rounded-6 flex size-7 shrink-0 items-center justify-center text-sm font-semibold">
          {section}
        </span>
        <span className="text-neutralMuted text-17 font-semibold">{question}</span>
      </div>
      <p className="text-neutral whitespace-pre-wrap">{answer}</p>
    </div>
  );
};

interface AnswerListProps {
  answers: AnswerProps[];
}

export const AnswerList = ({ answers }: AnswerListProps) => {
  // TODO: API 연동 시 length 체크가 아니라 쿼리의 에러 상태(isError 등)로 분기 필요
  if (answers.length === 0) {
    return (
      <div className="flex size-full items-center justify-center">
        <Result
          description="지원자가 제출한 서류 응답이 아직 연동되지 않았어요."
          figure={<Lottie className="size-10" delay={0.2} json={lotties.empty} />}
          title="연동된 서류 응답이 없어요"
        />
      </div>
    );
  }

  return (
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
};
