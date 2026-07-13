import { Result } from '@yourssu-inhouse/interior';
import { MdErrorOutline, MdInbox, MdSearchOff } from 'react-icons/md';

const Frame = ({ children }: React.PropsWithChildren) => (
  <div className="bg-greyOpacity50 rounded-2 flex w-full justify-center p-6">{children}</div>
);

export const ResultView = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">title 만</h3>
        <Frame>
          <Result title="결과가 없어요" />
        </Frame>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">title + description</h3>
        <Frame>
          <Result description="조건을 바꾸거나 새로 검색해 보세요." title="검색 결과가 없어요" />
        </Frame>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">figure (아이콘)</h3>
        <Frame>
          <Result
            description="표시할 항목이 없어요."
            figure={<MdInbox size={56} />}
            title="빈 상태"
          />
        </Frame>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">유즈케이스: 빈 목록</h3>
        <Frame>
          <Result
            description="새 항목을 추가하거나 필터를 초기화해 보세요."
            figure={<MdSearchOff size={56} />}
            title="조건에 맞는 항목이 없어요"
          />
        </Frame>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">유즈케이스: 에러 상태</h3>
        <Frame>
          <Result
            description="잠시 후 다시 시도해 주세요."
            figure={<MdErrorOutline size={56} />}
            title="문제가 발생했어요"
          />
        </Frame>
      </div>
    </div>
  );
};
