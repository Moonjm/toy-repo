import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@repo/ui';

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4 text-slate-600">
          <p className="text-lg font-semibold">문제가 발생했습니다</p>
          <p className="text-sm text-slate-400">{this.state.error.message}</p>
          <Button variant="accent" size="md" onClick={() => this.setState({ error: null })}>
            다시 시도
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
