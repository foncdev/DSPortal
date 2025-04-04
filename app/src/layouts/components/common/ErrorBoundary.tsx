import { Component, ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.scss';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render shows the fallback UI
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // You can log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    resetError = (): void => {
        this.setState({
            hasError: false,
            error: null
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className={styles.errorContainer}>
                    <div className={styles.errorContent}>
                        <h2 className={styles.errorTitle}>오류가 발생했습니다</h2>
                        <div className={styles.errorMessage}>
                            {this.state.error?.message || '예상치 못한 오류가 발생했습니다.'}
                        </div>
                        <button
                            className={styles.resetButton}
                            onClick={this.resetError}
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;