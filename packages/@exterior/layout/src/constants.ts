/*
  TabSection 접기 상태를 localStorage 에 저장하는 키예요. Sidebar(접기 토글 버튼)와
  TabSection(폴드 애니메이션)이 같은 키로 react-simplikit useStorageState 를 각각 호출해요.
  useStorageState 가 모듈 단위 listeners 로 같은 탭 내 인스턴스 간 동기화하므로
  TabSectionContext.Provider 없이 두 컴포넌트가 상태를 공유해요.
*/
export const TAB_SECTION_COLLAPSED_STORAGE_KEY = 'tab-section-collapsed';
