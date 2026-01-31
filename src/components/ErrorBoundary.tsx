import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem',
                    backgroundColor: '#f8fafc',
                    fontFamily: 'system-ui, sans-serif',
                }}>
                    <div style={{
                        maxWidth: '600px',
                        width: '100%',
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    }}>
                        <h1 style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: '#dc2626',
                            marginBottom: '1rem',
                        }}>
                            Đã xảy ra lỗi
                        </h1>
                        <p style={{
                            color: '#64748b',
                            marginBottom: '1.5rem',
                        }}>
                            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại sau.
                        </p>
                        <details style={{
                            marginTop: '1rem',
                            padding: '1rem',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                        }}>
                            <summary style={{
                                cursor: 'pointer',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                            }}>
                                {process.env.NODE_ENV === 'development' ? 'Chi tiết lỗi (Development)' : 'Thông tin lỗi'}
                            </summary>
                            <div style={{ marginTop: '0.5rem' }}>
                                <p style={{ color: '#dc2626', fontWeight: '600', marginBottom: '0.5rem' }}>
                                    {this.state.error?.message || 'Unknown error'}
                                </p>
                                {process.env.NODE_ENV === 'development' && this.state.error && (
                                    <pre style={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        color: '#64748b',
                                        fontSize: '0.8rem',
                                        marginTop: '0.5rem',
                                        padding: '0.5rem',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '4px',
                                        overflow: 'auto',
                                        maxHeight: '300px',
                                    }}>
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                )}
                                {process.env.NODE_ENV === 'production' && (
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                        Vui lòng mở Developer Tools (F12) → Console để xem chi tiết lỗi.
                                    </p>
                                )}
                            </div>
                        </details>
                        <button
                            onClick={() => {
                                window.location.reload();
                            }}
                            style={{
                                marginTop: '1.5rem',
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Tải lại trang
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
