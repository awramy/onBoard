import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { withTranslation, type WithTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';

type Props = WithTranslation & {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = { hasError: boolean; error: Error | null };

class ErrorBoundaryInner extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
    toast.error(error.message || 'Unhandled error');
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    if (this.props.fallback) {
      return this.props.fallback;
    }
    const { t } = this.props;
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <EmptyState
          icon={AlertTriangle}
          title={t('errors.boundaryTitle')}
          description={t('errors.boundaryDescription')}
          action={
            <Button onClick={this.handleReload}>{t('errors.reload')}</Button>
          }
          className="max-w-md"
        />
      </div>
    );
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryInner);
