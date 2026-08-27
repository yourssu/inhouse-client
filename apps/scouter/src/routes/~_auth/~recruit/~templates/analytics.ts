/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

type NoEventProperties = Record<never, never>;

export interface TemplateAnalyticsEventProperties {
  /** 템플릿 메뉴에서 메일 작성, 수정 또는 삭제를 선택했을 때 발생해요. */
  template_action_click: {
    template_action: 'compose_mail' | 'delete' | 'edit';
    template_id: number;
  };
  /** 템플릿 생성 버튼을 클릭해 편집기를 열었을 때 발생해요. */
  template_create_click: NoEventProperties;
  /** 새 템플릿 생성 API가 성공했을 때 발생해요. */
  template_create_complete: NoEventProperties;
  /** 템플릿 삭제 API가 성공했을 때 발생해요. */
  template_delete_complete: {
    template_id: number;
  };
  /** 템플릿 수정 API가 성공했을 때 발생해요. */
  template_update_complete: {
    template_id: number;
  };
}

export interface TemplateAnalyticsCommonProperties {
  event_schema_version: 'v1';
}

export type TrackTemplateEvent = <EventName extends keyof TemplateAnalyticsEventProperties>(
  eventName: EventName,
  properties: TemplateAnalyticsEventProperties[EventName],
) => void;

export const TemplateAnalyticsContext = createContext<null | TrackTemplateEvent>(null);

export const useTemplateAnalytics = () => {
  const trackTemplateEvent = useContext(TemplateAnalyticsContext);

  if (!trackTemplateEvent) {
    throw new Error('TemplateAnalyticsContext.Provider 안에서 사용해야 해요.');
  }

  return trackTemplateEvent;
};
