import { Badge } from '@yourssu-inhouse/interior';
import { InlineButton } from '@yourssu-inhouse/interior';
import { Table } from '@yourssu-inhouse/interior';
// [Imports]
import { useState } from 'react';

// === 1. Props 및 필요 타입들 ===
// No props needed for the test view

// === 2. 컴포넌트 본체 코드 ===
export const TableView = () => {
  const [selectedPart, setSelectedPart] = useState<string | undefined>(undefined);

  const handlePartChange = (val: string) => {
    setSelectedPart(val === '전체' ? undefined : val);
  };

  const filteredMembers = selectedPart
    ? dummyMembers.filter((member) => member.part === selectedPart)
    : dummyMembers;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">Table.Skeleton (로딩 상태)</h3>
        <div className="bg-lightBackground border-greyOpacity100 rounded-xl border p-4">
          <Table.Skeleton count={5} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-15 text-greyOpacity900 font-semibold">
          Table (일반 상태 / 호버 및 스크롤)
        </h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <h4 className="text-13 text-greyOpacity500 font-semibold">stickyHorizontal: false</h4>
            <div className="bg-lightBackground border-greyOpacity100 rounded-xl border p-4">
              <Table rowCount={dummyMembers.length} stickyHorizontal={false}>
                <Table.Head>
                  <Table.Th className="min-w-30">이름</Table.Th>
                  <Table.Th className="min-w-40">학번</Table.Th>
                  <Table.Th className="min-w-50">학과</Table.Th>
                  <Table.Th className="min-w-30">파트</Table.Th>
                  <Table.Th className="min-w-30">상태</Table.Th>
                  <Table.Th className="min-w-30">회비 납부</Table.Th>
                </Table.Head>
                <Table.Body>
                  {dummyMembers.map((member) => (
                    <Table.Row hoverable key={member.id}>
                      <Table.Cell className="min-w-30">
                        <span className="text-neutral font-semibold">{member.name}</span>
                      </Table.Cell>
                      <Table.Cell className="min-w-40">{member.studentId}</Table.Cell>
                      <Table.Cell className="min-w-50">{member.major}</Table.Cell>
                      <Table.Cell className="min-w-30">{member.part}</Table.Cell>
                      <Table.Cell className="min-w-30">
                        <Badge color={member.status === '재학' ? 'blue' : 'yellow'} size="md">
                          {member.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="min-w-30">
                        <Badge color={member.pay === '납부완료' ? 'green' : 'red'} size="md">
                          {member.pay}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-13 text-greyOpacity500 font-semibold">stickyHorizontal: true</h4>
            <div className="bg-lightBackground border-greyOpacity100 rounded-xl border p-4">
              <Table rowCount={dummyMembers.length} stickyHorizontal={true}>
                <Table.Head>
                  <Table.Th className="min-w-30">이름</Table.Th>
                  <Table.Th className="min-w-40">학번</Table.Th>
                  <Table.Th className="min-w-50">학과</Table.Th>
                  <Table.Th className="min-w-30">파트</Table.Th>
                  <Table.Th className="min-w-30">상태</Table.Th>
                  <Table.Th className="min-w-30">회비 납부</Table.Th>
                </Table.Head>
                <Table.Body>
                  {dummyMembers.map((member) => (
                    <Table.Row hoverable key={member.id}>
                      <Table.Cell className="min-w-30">
                        <span className="text-neutral font-semibold">{member.name}</span>
                      </Table.Cell>
                      <Table.Cell className="min-w-40">{member.studentId}</Table.Cell>
                      <Table.Cell className="min-w-50">{member.major}</Table.Cell>
                      <Table.Cell className="min-w-30">{member.part}</Table.Cell>
                      <Table.Cell className="min-w-30">
                        <Badge color={member.status === '재학' ? 'blue' : 'yellow'} size="md">
                          {member.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="min-w-30">
                        <Badge color={member.pay === '납부완료' ? 'green' : 'red'} size="md">
                          {member.pay}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-15 text-greyOpacity900 font-semibold">
            Table.ThSelect (필터링 선택이 가능한 헤더)
          </h3>
          {selectedPart && (
            <InlineButton onClick={() => setSelectedPart(undefined)}>필터 제거</InlineButton>
          )}
        </div>
        <div className="bg-lightBackground border-greyOpacity100 rounded-xl border p-4">
          <Table rowCount={filteredMembers.length} stickyHorizontal>
            <Table.Head>
              <Table.Th className="min-w-30">이름</Table.Th>
              <Table.Th className="min-w-40">학번</Table.Th>
              <Table.Th className="min-w-50">학과</Table.Th>
              <Table.ThSelect
                items={parts}
                onValueChange={handlePartChange}
                placeholder="파트"
                value={selectedPart}
              />
              <Table.Th className="min-w-30">상태</Table.Th>
              <Table.Th className="min-w-30">회비 납부</Table.Th>
            </Table.Head>
            <Table.Body>
              {filteredMembers.map((member) => (
                <Table.Row hoverable key={member.id}>
                  <Table.Cell className="min-w-30">
                    <span className="text-neutral font-semibold">{member.name}</span>
                  </Table.Cell>
                  <Table.Cell className="min-w-40">{member.studentId}</Table.Cell>
                  <Table.Cell className="min-w-50">{member.major}</Table.Cell>
                  <Table.Cell className="min-w-30">{member.part}</Table.Cell>
                  <Table.Cell className="min-w-30">
                    <Badge color={member.status === '재학' ? 'blue' : 'yellow'} size="md">
                      {member.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="min-w-30">
                    <Badge color={member.pay === '납부완료' ? 'green' : 'red'} size="md">
                      {member.pay}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};

// === 3. 렌더링에 필요한 정적 값 (상수 선언부) ===
const parts = ['Server', 'Web', 'iOS', 'Design', 'Android'] as const;

const dummyMembers = [
  {
    id: 1,
    name: '김철수',
    part: 'Server',
    studentId: '20201234',
    major: '컴퓨터학부',
    status: '재학',
    pay: '납부완료',
  },
  {
    id: 2,
    name: '이영희',
    part: 'Web',
    studentId: '20215678',
    major: '소프트웨어학부',
    status: '재학',
    pay: '미납',
  },
  {
    id: 3,
    name: '박민수',
    part: 'iOS',
    studentId: '20199876',
    major: '글로벌미디어학부',
    status: '휴학',
    pay: '납부완료',
  },
  {
    id: 4,
    name: '최지우',
    part: 'Design',
    studentId: '20224321',
    major: '미디어경영학과',
    status: '재학',
    pay: '미납',
  },
  {
    id: 5,
    name: '정우성',
    part: 'Android',
    studentId: '20181111',
    major: '전자공학부',
    status: '휴학',
    pay: '납부완료',
  },
];
