import './styles/index.css';

import { createExteriorApp } from '@yourssu-inhouse/exterior';

import { routeTree } from '@/routeTree.gen';

/*
  scouter 는 Module Federation remote("scouter")예요. shell 이 단일 라우터·인증·크롬을 소유해요.
  이 main.tsx 는 standalone dev preview·vite build entry 용이고, shell 은 `./routeTree` 만 로드해요.
  standalone preview 는 크롬·인증 없이 recruit 서브트리만 렌더해요.
*/
const app = createExteriorApp({
  routeTree,
  queryClientConfig: {
    defaultOptions: {
      queries: {
        throwOnError: true,
      },
    },
  },
});

export const router = app.router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

void app.mount();
