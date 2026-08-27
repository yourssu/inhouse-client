/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

type MailTargetProperties =
  | {
      part_id: number;
      target_scope: 'part';
    }
  | {
      target_scope: 'all';
    };

type MailSendProperties = MailTargetProperties & {
  bcc_count: number;
  recipient_count: number;
  send_mode: 'immediate' | 'scheduled';
  template_id: number;
};

type MailTestSendProperties = MailTargetProperties & {
  template_id: number;
};

export interface MailAnalyticsEventProperties {
  /** 발송 다이얼로그에서 즉시 또는 예약 발송 요청을 실행했을 때 발생해요. */
  mail_send_click: MailSendProperties;
  /** 즉시 또는 예약 발송 요청 API가 성공했을 때 발생해요. */
  mail_send_request_complete: MailSendProperties;
  /** 메일 관리 또는 작성 화면에서 선택한 템플릿 상세 조회가 성공했을 때 발생해요. */
  mail_template_selected: {
    entry_point: 'mail_composer' | 'mail_management';
    template_id: number;
  };
  /** 테스트 발송 다이얼로그에서 발송 요청을 실행했을 때 발생해요. */
  mail_test_send_click: MailTestSendProperties;
  /** 테스트 메일 발송 API가 성공했을 때 발생해요. */
  mail_test_send_complete: MailTestSendProperties;
}

export interface MailAnalyticsCommonProperties {
  event_schema_version: 'v1';
}

export type TrackMailEvent = <EventName extends keyof MailAnalyticsEventProperties>(
  eventName: EventName,
  properties: MailAnalyticsEventProperties[EventName],
) => void;

export const MailAnalyticsContext = createContext<null | TrackMailEvent>(null);

export const useMailAnalytics = () => {
  const trackMailEvent = useContext(MailAnalyticsContext);

  if (!trackMailEvent) {
    throw new Error('MailAnalyticsContext.Provider 안에서 사용해야 해요.');
  }

  return trackMailEvent;
};
