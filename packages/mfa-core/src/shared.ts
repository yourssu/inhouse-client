/*
  Module Federation shared dependency 정책의 단일 출처(single source of truth).
  이전에는 shell·scouter·inhouse 의 vite.config 가 각자 같은 shared 객체를 복붙했어요.
  이제 mfa-vite 가 buildFederationShared() 로부터 federation shared config 를 생성하고,
  모든 app 이 같은 정책을 써요. 새 shared 를 추가하려면 여기 한 곳만 고쳐요.

  react/react-dom/router/query/interior/exterior 는 MF 가 실제로 share 해요.
  react-simplikit / overlay-kit / motion / es-toolkit / zod 는 context·store 성격이라
  singleton 으로 묶어야 plugin 경계에서 상태가 쪼개지지 않아요(POS 의 global module 버전
  검사와 같은 맥락). requiredVersion 이 있으면 mfa-shell 의 assertSharedVersions() 가
  런타임에 일치를 검사해요.

  이 파일은 build-time(mfa-vite, Vite config node context) 에도 import 되므로 DOM/react
  타입을 직접 참조하지 않아요. 런타임 버전 검사(react 동적 import 필요) 는 mfa-shell 이
  app context(DOM+react types) 에서 수행해요.
*/
interface SharedDepPolicy {
  requiredVersion?: string;
  singleton: true;
}

type FederationSharedConfig = Record<string, SharedDepPolicy>;

export const SHARED_DEPS = {
  react: { requiredVersion: '^19.2.6', singleton: true },
  'react-dom': { requiredVersion: '^19.2.6', singleton: true },
  '@tanstack/react-router': { requiredVersion: '^1.170.11', singleton: true },
  '@tanstack/react-query': { requiredVersion: '^5.101.0', singleton: true },
  '@yourssu-inhouse/interior': { singleton: true },
  '@yourssu-inhouse/exterior': { singleton: true },
  // /layout 서브패스도 singleton 공유해야 shell 의 Sidebar 와 remote 의 TabSection 이
  // 같은 react-simplikit useStorageState 모듈(= 같은 listeners Set)을 써요. 메인 엔트리만
  // shared 에 넣으면 서브패스가 각자 번들링돼 createContext 가 2개 생겨 Provider/useContext 가
  // 매칭되지 않아요.
  '@yourssu-inhouse/exterior/layout': { singleton: true },
  // context·store 성격 라이브러리. app 마다 버전이 달라도 singleton 으로 강제해요.
  'react-simplikit': { singleton: true },
  'overlay-kit': { singleton: true },
  motion: { singleton: true },
  zod: { singleton: true },
  'es-toolkit': { singleton: true },
} as const satisfies Record<string, SharedDepPolicy>;

/*
  federation({ shared }) 에 전달할 shared config 를 생성해요. mfa-vite 가 shell·remote
  양쪽에서 호출해요. as const 객체를 그대로 반환해도 되지만, 명시적 복사본으로 반환해
  호출측이 mutate 해도 원본 정책이 오염되지 않게 해요.
*/
export const buildFederationShared = (): FederationSharedConfig => ({ ...SHARED_DEPS });

/*
  singleton 으로 묶어야 하는 context/store 패키지 목록. mfa-vite 가 빌드에 포함시키고,
  문서/검증용으로도 써요.
*/
export const SINGLETON_CONTEXT_PACKAGES = [
  'react-simplikit',
  'overlay-kit',
  'motion',
  '@yourssu-inhouse/interior',
  '@yourssu-inhouse/exterior',
  '@yourssu-inhouse/exterior/layout',
] as const;
