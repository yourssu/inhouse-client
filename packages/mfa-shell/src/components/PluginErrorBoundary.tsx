import { Component, type ErrorInfo, type ReactNode } from 'react';

import { RemoteUnavailable } from './RemoteUnavailable';

/*
  plugin 서브트리 렌더 중 throw 된 에러를 잡는 React error boundary예요. shell router 의
  defaultErrorComponent 로 써서, 한 plugin 의 렌더 에러가 전체 shell 을 하얀 화면으로
  죽이지 않도록 해요. 에러 정보와 함께 unavailable UI 를 보여요.
*/
interface PluginErrorBoundaryProps {
  children: ReactNode;
  /** boundary 가 잡은 에러를 상위로 보고할 콜백(선택). */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface PluginErrorBoundaryState {
  error: Error | null;
}

export class PluginErrorBoundary extends Component<
  PluginErrorBoundaryProps,
  PluginErrorBoundaryState
> {
  override state: PluginErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): PluginErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  override render(): ReactNode {
    if (this.state.error) {
      return <RemoteUnavailable availablePlugins={[]} failedPlugins={['unknown']} />;
    }
    return this.props.children;
  }
}
