import { http, HttpResponse } from 'msw';

import type { ApplicantDocumentAnswersType, ApplicantType } from '@/apis/applicants/schema';

import { config } from '@/config';

const mockApplicant: ApplicantType = {
  applicantId: 1,
  division: '개발',
  part: 'Frontend',
  name: '김철수',
  state: 'UNDER_REVIEW',
  applicationDate: '2026-07-01',
  email: 'chulsoo.kim@example.com',
  phoneNumber: '010-1234-5678',
  department: '컴퓨터학부',
  studentId: '20231234',
  semester: '25-2',
  age: '24',
  availableTimes: ['2026-07-25T10:00:00.000Z', '2026-07-25T13:00:00.000Z'],
};

const mockDocumentAnswers: ApplicantDocumentAnswersType = {
  applicantId: 1,
  name: mockApplicant.name,
  part: mockApplicant.part,
  submittedAt: '2026-07-01T09:00:00.000Z',
  sections: [
    {
      sectionId: 1,
      question: 'Yourssu에 지원하게 된 동기를 작성해주세요.',
      answer:
        '개발을 공부하면서 혼자서 기술을 익히는 것만으로는 실제 서비스 개발에 필요한 다양한 경험을 쌓기 어렵다고 느꼈습니다. 특히 하나의 서비스를 완성하기 위해서는 개발 능력뿐만 아니라 팀원들과의 소통, 코드 리뷰, 협업 도구 활용, 일정 관리 등 다양한 역량이 필요하다고 생각합니다. Yourssu는 개발에 관심 있는 사람들이 함께 고민하고 직접 서비스를 만들어 나가는 과정에서 이러한 경험을 쌓을 수 있는 곳이라고 생각해 지원하게 되었습니다. 저는 활동을 통해 새로운 기술을 배우는 것에 그치지 않고, 실제 사용자가 이용할 수 있는 서비스를 기획하고 개발하는 전 과정을 경험하고 싶습니다. 또한 다양한 관심 분야와 경험을 가진 구성원들과 지식을 공유하며 서로 성장하고, 제가 배운 내용 역시 다른 구성원들에게 적극적으로 나누면서 함께 발전하는 개발자가 되고 싶습니다.',
    },
    {
      sectionId: 2,
      question: '본인의 강점과 이를 활용한 경험을 작성해주세요.',
      answer:
        '저의 강점은 새로운 기술이나 문제를 마주했을 때 원리를 이해할 때까지 꾸준히 탐구하는 태도입니다. 단순히 문제를 해결하는 것에 그치지 않고, 왜 문제가 발생했는지와 더 나은 해결 방법은 없는지를 함께 고민하려고 노력합니다. 프로젝트를 진행하면서 처음 접하는 기술을 사용해야 했던 경험이 있는데, 공식 문서와 다양한 자료를 찾아보며 필요한 개념을 학습하고 직접 코드를 작성하면서 문제를 해결했습니다. 이 과정에서 시행착오도 많았지만, 발생한 문제와 해결 과정을 정리하면서 비슷한 문제가 다시 발생했을 때 더욱 빠르게 대응할 수 있었습니다. 또한 제가 이해한 내용을 팀원들과 공유하며 함께 문제를 해결하려고 노력했습니다. 이러한 경험을 바탕으로 Yourssu에서도 새로운 기술과 문제를 적극적으로 탐구하고, 배운 내용을 구성원들과 공유하며 팀의 성장에 기여하고 싶습니다.',
    },
    {
      sectionId: 3,
      question: '함께 활동하고 싶은 이유를 작성해주세요.',
      answer:
        '개발은 개인의 역량도 중요하지만 다양한 사람들과 함께 의견을 나누고 협력할 때 더 좋은 결과를 만들 수 있다고 생각합니다. 혼자 개발할 때는 자신의 관점에서 문제를 바라보기 쉽지만, 팀원들과 함께 활동하면 서로 다른 경험과 관점을 공유하면서 생각하지 못했던 해결 방법을 발견할 수 있습니다. 저는 Yourssu에서 개발에 관심과 열정을 가진 구성원들과 함께 실제 문제를 고민하고 서비스를 만들어가는 경험을 하고 싶습니다. 특히 프로젝트를 진행하면서 코드 리뷰와 기술적인 토론을 통해 서로의 지식을 공유하고, 어려운 문제가 발생했을 때 함께 해결책을 찾아가는 과정을 경험하고 싶습니다. 저 역시 제가 알고 있는 지식과 경험을 적극적으로 공유하고 다른 구성원의 의견을 열린 태도로 받아들이겠습니다. 서로의 부족한 부분을 보완하며 개인과 팀이 함께 성장할 수 있는 활동을 만들어가고 싶습니다.',
    },
    {
      sectionId: 4,
      question: 'Yourssu에서 가장 중요하다고 여기는 가치는 무엇인지 작성해주세요.',
      answer:
        '제가 Yourssu에서 가장 중요하다고 생각하는 가치는 함께 성장하는 문화입니다. 개발 분야는 기술의 변화가 빠르기 때문에 개인이 모든 것을 알고 잘하기는 어렵다고 생각합니다. 따라서 각자가 가진 지식과 경험을 적극적으로 공유하고, 모르는 것을 자유롭게 질문할 수 있는 환경이 중요합니다. 누군가의 질문을 단순히 부족함으로 바라보는 것이 아니라 함께 고민하고 배우는 기회로 받아들인다면 구성원 모두가 더 빠르게 성장할 수 있다고 생각합니다. 또한 프로젝트에서 문제가 발생했을 때 개인의 책임을 찾기보다 문제의 원인과 해결 방법에 집중하는 태도 역시 중요합니다. 저는 Yourssu에서 구성원들의 의견을 존중하고 적극적으로 소통하며, 제가 배운 지식과 경험을 다른 사람들과 나누고 싶습니다. 이러한 문화가 지속된다면 개인의 성장뿐만 아니라 팀 전체의 개발 역량과 결과물의 품질도 함께 높아질 수 있다고 생각합니다.',
    },
  ],
};

export const handlers = [
  http.get(`${config.apiBaseURL}/applicants/:applicantId`, () => {
    return HttpResponse.json(mockApplicant);
  }),

  http.get(`${config.apiBaseURL}/applicants/:applicantId/answers`, () => {
    return HttpResponse.json(mockDocumentAnswers);
  }),
];
