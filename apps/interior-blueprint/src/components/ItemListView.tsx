import { InlineButton, ItemList } from '@yourssu-inhouse/interior';

export const ItemListView = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">기본: Header + Body + Item</h3>
        <div className="bg-greyOpacity50 rounded-2 w-[360px] p-4">
          <ItemList>
            <ItemList.Header>
              <span>멤버 정보</span>
              <ItemList.HeaderButton>편집</ItemList.HeaderButton>
            </ItemList.Header>
            <ItemList.Body>
              <ItemList.Item label="이름">홍길동</ItemList.Item>
              <ItemList.Item label="이메일">honggildong@yourssu.com</ItemList.Item>
              <ItemList.Item label="부서">프로덕트</ItemList.Item>
            </ItemList.Body>
          </ItemList>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">Item 의 tooltipContent</h3>
        <div className="bg-greyOpacity50 rounded-2 w-[360px] p-4">
          <ItemList>
            <ItemList.Header>
              <span>권한</span>
            </ItemList.Header>
            <ItemList.Body>
              <ItemList.Item label="역할" tooltipContent="조직 내 역할 등급이에요">
                관리자
              </ItemList.Item>
              <ItemList.Item label="접근 레벨" tooltipContent="0~5 단계로 부여돼요">
                3
              </ItemList.Item>
            </ItemList.Body>
          </ItemList>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">HeaderButton 커스텀 액션</h3>
        <div className="bg-greyOpacity50 rounded-2 w-[360px] p-4">
          <ItemList>
            <ItemList.Header>
              <span>알림</span>
              <ItemList.HeaderButton onClick={() => {}}>모두 읽음</ItemList.HeaderButton>
            </ItemList.Header>
            <ItemList.Body>
              <ItemList.Item label="읽지 않음">5</ItemList.Item>
              <ItemList.Item label="최근">오늘</ItemList.Item>
            </ItemList.Body>
          </ItemList>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">유즈케이스: 상세 패널</h3>
        <div className="bg-greyOpacity50 rounded-2 w-[420px] p-4">
          <ItemList>
            <ItemList.Header>
              <span>계정 상세</span>
              <InlineButton>더보기</InlineButton>
            </ItemList.Header>
            <ItemList.Body>
              <ItemList.Item label="가입일">2024-03-12</ItemList.Item>
              <ItemList.Item label="마지막 로그인">2026-07-13</ItemList.Item>
              <ItemList.Item label="상태" tooltipContent="현재 계정 활성 상태">
                활성
              </ItemList.Item>
            </ItemList.Body>
          </ItemList>
        </div>
      </div>
    </div>
  );
};
