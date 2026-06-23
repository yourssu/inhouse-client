import { disassemble } from 'es-hangul';
import { http, HttpResponse } from 'msw';

import { type Member, type MemberState, type PartName } from '@/apis/members/schema';

// 1. Calculate current semester dynamically based on rules:
// - XX-1: March 1st ~ August 31st (month 2 to 7)
// - XX-2: September 1st ~ February end (month 8 to 11 and month 0 to 1 of next year)
export const calculateCurrentSemester = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed: 0=Jan, 11=Dec

  let semesterYear: number;
  let semesterTerm: number;

  if (month >= 2 && month <= 7) {
    semesterYear = year;
    semesterTerm = 1;
  } else if (month >= 8) {
    semesterYear = year;
    semesterTerm = 2;
  } else {
    semesterYear = year - 1;
    semesterTerm = 2;
  }

  const twoDigitYear = semesterYear % 100;
  return `${twoDigitYear}-${semesterTerm}`;
};

// 2. Generate list of semesters from 18-1 to current semester
export const generateSemesters = (currentSemester: string): string[] => {
  const semesters: string[] = [];
  const [currYearStr, currSemStr] = currentSemester.split('-');
  const currYear = parseInt(currYearStr, 10);
  const currSem = parseInt(currSemStr, 10);

  let year = 18;
  let sem = 1;

  while (year < currYear || (year === currYear && sem <= currSem)) {
    semesters.push(`${year}-${sem}`);
    if (sem === 1) {
      sem = 2;
    } else {
      sem = 1;
      year += 1;
    }
  }

  return semesters;
};

const getSemestersInRange = (startSem: string, endSem: string): string[] => {
  const semesters = generateSemesters(endSem);
  const startIndex = semesters.indexOf(startSem);
  if (startIndex === -1) {
    return [startSem];
  }
  return semesters.slice(startIndex);
};

const generateHistory = (params: {
  completedSemester?: null | string;
  currentSemester: string;
  inactiveSemesters?: string[];
  inactiveStartSemester?: string;
  joinSemester: string;
  state: MemberState;
  withdrawnSemester?: null | string;
}): { [semester: string]: MemberState }[] => {
  const endSemester =
    params.state === 'withdrawn' && params.withdrawnSemester
      ? params.withdrawnSemester
      : params.state === 'completed' && params.completedSemester
        ? params.completedSemester
        : params.currentSemester;
  const range = getSemestersInRange(params.joinSemester, endSemester);
  return range.map((sem) => {
    let semState: MemberState = 'active';

    if (params.inactiveSemesters?.includes(sem)) {
      semState = 'inactive';
    } else if (params.state === 'inactive') {
      const inactiveStart = params.inactiveStartSemester || params.joinSemester;
      if (sem >= inactiveStart) {
        semState = 'inactive';
      }
    } else if (params.state === 'completed') {
      const completedSem = params.completedSemester || params.currentSemester;
      if (sem >= completedSem) {
        semState = 'completed';
      }
    } else if (params.state === 'withdrawn') {
      const withdrawnSem = params.withdrawnSemester || params.currentSemester;
      if (sem >= withdrawnSem) {
        semState = 'withdrawn';
      }
    }

    return { [sem]: semState };
  });
};

const initialCurrentSemester = calculateCurrentSemester();

const familyNames = [
  '김',
  '이',
  '박',
  '최',
  '정',
  '강',
  '조',
  '윤',
  '장',
  '임',
  '한',
  '신',
  '오',
  '서',
  '황',
  '권',
  '백',
  '유',
  '고',
  '홍',
];
const givenNames = [
  '민수',
  '영희',
  '철수',
  '수민',
  '지은',
  '재훈',
  '다현',
  '원준',
  '지아',
  '동현',
  '지우',
  '태양',
  '승우',
  '유진',
  '민기',
  '보람',
  '준혁',
  '하은',
  '동우',
  '서연',
];
const nicknameMap = [
  { en: 'Mocha', ko: '모카' },
  { en: 'Ren', ko: '렌' },
  { en: 'Brynn', ko: '브린' },
  { en: 'Devin', ko: '데빈' },
  { en: 'Alice', ko: '앨리스' },
  { en: 'Leo', ko: '레오' },
  { en: 'Luna', ko: '루나' },
  { en: 'Noah', ko: '노아' },
  { en: 'Chloe', ko: '클로이' },
  { en: 'Max', ko: '맥스' },
  { en: 'Daisy', ko: '데이지' },
  { en: 'Solar', ko: '솔라' },
  { en: 'Ken', ko: '켄' },
  { en: 'Emma', ko: '엠마' },
  { en: 'Mark', ko: '마크' },
  { en: 'Bonnie', ko: '보니' },
  { en: 'Jack', ko: '잭' },
  { en: 'Chloe2', ko: '클로이이' },
  { en: 'David', ko: '데이비드' },
  { en: 'Sarah', ko: '사라' },
  { en: 'Alex', ko: '알렉스' },
  { en: 'Bella', ko: '벨라' },
  { en: 'Charlie', ko: '찰리' },
  { en: 'Daniel', ko: '대니얼' },
  { en: 'Eva', ko: '에바' },
  { en: 'Frank', ko: '프랭크' },
  { en: 'Grace', ko: '그레이스' },
  { en: 'Henry', ko: '헨리' },
  { en: 'Ivy', ko: '아이비' },
  { en: 'James', ko: '제임스' },
  { en: 'Kate', ko: '케이트' },
  { en: 'Liam', ko: '리암' },
  { en: 'Mia', ko: '미아' },
  { en: 'Noah2', ko: '노아아' },
  { en: 'Olivia', ko: '올리비아' },
  { en: 'Peter', ko: '피터' },
  { en: 'Rose', ko: '로즈' },
  { en: 'Sam', ko: '샘' },
  { en: 'Toby', ko: '토비' },
  { en: 'Vicky', ko: '비키' },
];
const standardParts: PartName[] = [
  'Backend',
  'Frontend',
  'Android',
  'iOS',
  'Product Design',
  'PM',
  'Marketing',
  'HR',
  'Legal',
];
const departments = [
  '컴퓨터학부',
  '소프트웨어학부',
  '전자공학부',
  '경영학부',
  '미디어학부',
  '법학과',
  '산업공학과',
  '시각디자인학과',
];

const mockMembersRaw = Array.from({ length: 65 }, (_, index) => {
  const memberId = index + 1;
  const name = familyNames[index % familyNames.length] + givenNames[index % givenNames.length];
  const nicknameItem = nicknameMap[index % nicknameMap.length];
  const suffix = Math.floor(index / nicknameMap.length);
  const nickname = suffix > 0 ? `${nicknameItem.en}${suffix + 1}` : nicknameItem.en;
  const nicknameKo = suffix > 0 ? `${nicknameItem.ko}${suffix + 1}` : nicknameItem.ko;

  let position: 'LEAD' | 'MEMBER' | 'VICELEAD' = 'MEMBER';
  if (memberId === 1) {
    position = 'LEAD';
  } else if (memberId === 2) {
    position = 'VICELEAD';
  } else if (memberId === 3) {
    position = 'LEAD';
  } else {
    const standardIndex = memberId - 4;
    const remainder = standardIndex % 9;
    if (standardIndex === remainder) {
      position = 'LEAD';
    } else if (standardIndex === remainder + 9) {
      position = 'VICELEAD';
    }
  }

  let state: MemberState = 'active';
  if (memberId === 65) {
    state = 'withdrawn';
  } else if (position === 'MEMBER') {
    if (memberId % 12 === 0) {
      state = 'withdrawn';
    } else if (memberId % 7 === 0) {
      state = 'completed';
    } else if (memberId % 5 === 0) {
      state = 'inactive';
    }
  }

  const isDuesPaid = state === 'active' ? memberId % 3 !== 0 : null;
  const email = `${nickname.toLowerCase()}.urssu@gmail.com`;
  const phoneNumber = `010-${String(1000 + memberId * 11).padStart(4, '0')}-${String(5000 + memberId * 7).padStart(4, '0')}`;
  const department = departments[memberId % departments.length];
  const studentId = `${2020 + (memberId % 6)}${String(1000 + memberId * 7).padStart(4, '0')}`;

  const birthMonth = String(1 + (memberId % 12)).padStart(2, '0');
  const birthDay = String(1 + (memberId % 28)).padStart(2, '0');
  const birthDate = `${2000 + (memberId % 6)}-${birthMonth}-${birthDay}`;

  const joinYear = 20 + (memberId % 5);
  const joinSemTerm = 1 + (memberId % 2);
  const joinSemester = `${joinYear}-${joinSemTerm}`;
  const note = `동아리 멤버 ${nickname}`;

  let isOnLeave: boolean | null = null;
  let grade: null | number = null;
  let inactiveReason: null | string = null;
  let expectedReturnSemester: null | string = null;
  let completedSemester: null | string = null;
  let withdrawnSemester: null | string = null;
  let inactiveStartSemester: string | undefined = undefined;
  let inactiveSemesters: string[] | undefined = undefined;

  if (state === 'active') {
    isOnLeave = memberId % 8 === 0;
    grade = 1 + (memberId % 4);
    if (memberId % 8 === 0) {
      const range = getSemestersInRange(joinSemester, initialCurrentSemester);
      if (range.length >= 4) {
        const startIdx = range.length >= 6 ? 2 : 1;
        inactiveSemesters = range.slice(startIdx, startIdx + 2);
      }
    }
  } else if (state === 'inactive') {
    inactiveReason = '휴학 및 개인 사유';
    expectedReturnSemester = '26-2';
    const inactStart = '25-2';
    inactiveStartSemester = inactStart >= joinSemester ? inactStart : joinSemester;
  } else if (state === 'completed') {
    const compSem = '25-2';
    completedSemester = compSem >= joinSemester ? compSem : joinSemester;
  } else if (state === 'withdrawn') {
    const withSem = memberId === 65 ? '25-2' : '25-1';
    withdrawnSemester = withSem >= joinSemester ? withSem : joinSemester;
  }

  const partNames: PartName[] = [];
  if (memberId === 1 || memberId === 2) {
    partNames.push('Head Lead');
  } else if (memberId === 3) {
    partNames.push('Finance');
  } else {
    const standardIndex = memberId - 4;
    const remainder = standardIndex % 9;
    partNames.push(standardParts[remainder]);

    if (position === 'MEMBER') {
      if (standardIndex % 3 === 0) {
        const secondPartIndex = (remainder + 2) % 9;
        partNames.push(standardParts[secondPartIndex]);
      }
    }
  }

  return {
    memberId,
    partNames,
    position,
    name,
    nickname,
    nicknameKo,
    state,
    isDuesPaid,
    email,
    phoneNumber,
    department,
    studentId,
    birthDate,
    joinSemester,
    note,
    isOnLeave,
    grade,
    inactiveReason,
    expectedReturnSemester,
    completedSemester,
    withdrawnSemester,
    inactiveStartSemester,
    inactiveSemesters,
  };
});

export const mockMembers: Member[] = mockMembersRaw.map((member) => {
  const history = generateHistory({
    currentSemester: initialCurrentSemester,
    joinSemester: member.joinSemester,
    state: member.state,
    completedSemester: member.completedSemester,
    withdrawnSemester: member.withdrawnSemester,
    inactiveStartSemester: member.inactiveStartSemester,
    inactiveSemesters: member.inactiveSemesters,
  });

  // Remove inactiveStartSemester which was a helper field
  const rest = { ...member };
  delete (rest as { inactiveStartSemester?: string }).inactiveStartSemester;
  delete (rest as { inactiveSemesters?: string[] }).inactiveSemesters;

  return {
    ...rest,
    history,
  };
});

export const handlers = [
  // 1. GET /parts
  http.get('/api/parts', () => {
    return HttpResponse.json([
      'Head Lead',
      'Finance',
      'HR',
      'Marketing',
      'Legal',
      'PM',
      'Backend',
      'Android',
      'iOS',
      'Frontend',
      'Product Design',
    ]);
  }),

  // 2-1. GET /semesters
  http.get('/api/semesters', () => {
    const currentSemester = calculateCurrentSemester();
    const semesters = generateSemesters(currentSemester);
    return HttpResponse.json(semesters);
  }),

  // 2-2. GET /semesters/current
  http.get('/api/semesters/current', () => {
    const currentSemester = calculateCurrentSemester();
    return HttpResponse.json(currentSemester);
  }),

  // 3. GET /members
  http.get('/api/members', ({ request }) => {
    const url = new URL(request.url);
    const pageParam = url.searchParams.get('page');
    const pageSizeParam = url.searchParams.get('pageSize');
    const queryParam = url.searchParams.get('query');
    const partParam = url.searchParams.get('part');
    const statusParam = url.searchParams.get('status');

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    let filteredMembers = mockMembers;
    if (queryParam) {
      const disassembledQuery = disassemble(queryParam.toLowerCase());
      filteredMembers = mockMembers.filter((member) => {
        const nameMatch = disassemble(member.name.toLowerCase()).includes(disassembledQuery);
        const nicknameMatch = disassemble(member.nickname.toLowerCase()).includes(
          disassembledQuery,
        );
        const nicknameKoMatch = disassemble(member.nicknameKo.toLowerCase()).includes(
          disassembledQuery,
        );
        return nameMatch || nicknameMatch || nicknameKoMatch;
      });
    }

    if (partParam) {
      filteredMembers = filteredMembers.filter((member) =>
        member.partNames.includes(partParam as PartName),
      );
    }

    if (statusParam) {
      filteredMembers = filteredMembers.filter((member) => member.state === statusParam);
    }

    const totalCount = filteredMembers.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filteredMembers.slice(startIndex, endIndex);

    return HttpResponse.json({
      items,
      totalCount,
      totalPages,
      page,
      pageSize,
    });
  }),

  // 4. GET /members/:memberId
  http.get('/api/members/:memberId', ({ params }) => {
    const memberId = parseInt(params.memberId as string, 10);
    const member = mockMembers.find((m) => m.memberId === memberId);
    if (!member) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(member);
  }),
];
