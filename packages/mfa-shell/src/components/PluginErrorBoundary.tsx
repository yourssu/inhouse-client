import { Component, type ErrorInfo, type ReactNode } from 'react';

import { RemoteUnavailable } from './RemoteUnavailable';

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
