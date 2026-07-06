import ky from 'ky';

// ky 2.x 는 1.x 의 prefixUrl 을 폐기하고 prefix/baseUrl 로 바꿨어요.
// 2.x 에 prefixUrl 을 넘기면 unknown option 으로 무시돼서 input('members' 같은 상대 경로)이
// 현재 페이지 URL(/members) 기준으로 resolve 돼 /members/members 중복 경로가 생겨요.
// MSW 핸들러와 실제 API base 가 /api 이므로 prefix 로 지정해요.
export const api = ky.create({
  prefix: '/api',
});
