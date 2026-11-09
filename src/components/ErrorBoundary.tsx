import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import {
    isDynamicImportError,
    tryReloadOnDynamicImportError,
} from '../utils/lazyWithRetry';

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

        if (isDynamicImportError(error)) {
            const reloaded = tryReloadOnDynamicImportError('ErrorBoundary', error);
            if (reloaded) {
                return;
            }
        }

        this.setState({
            error,
            errorInfo,
        });
    }

    render() {
        if (this.state.hasError) {
            const isChunkError = isDynamicImportError(this.state.error);

            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC] text-[#1E293B]">
                    <div className="max-w-lg w-full bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/80 shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#F05A28] flex items-center justify-center mb-4">
                            <AlertTriangle size={24} />
                        </div>

                        <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B] mb-2">
                            {isChunkError
                                ? 'Đã có bản cập nhật mới trên KeyT Hub'
                                : 'Đã xảy ra sự cố không mong muốn'}
                        </h1>

                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
                            {isChunkError
                                ? 'Hệ thống vừa cập nhật phiên bản mới. Vui lòng tải lại trang để đồng bộ tài nguyên mới nhất.'
                                : 'Ứng dụng gặp sự cố tạm thời trong quá trình hiển thị. Vui lòng tải lại trang hoặc quay về trang chủ.'}
                        </p>

                        <details className="mb-6 p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600">
                            <summary className="cursor-pointer font-semibold text-slate-700 select-none">
                                {import.meta.env.DEV ? 'Chi tiết lỗi (Development)' : 'Thông tin kỹ thuật'}
                            </summary>
                            <div className="mt-2.5 pt-2.5 border-t border-slate-200/70">
                                <p className="text-red-600 font-semibold break-words">
                                    {this.state.error?.message || 'Unknown error'}
                                </p>
                                {import.meta.env.DEV && this.state.error && (
                                    <pre className="whitespace-pre-wrap break-words text-slate-500 text-[11px] mt-2 p-2.5 bg-white rounded-lg border border-slate-200 overflow-auto max-h-60">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                )}
                            </div>
                        </details>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#F05A28] hover:bg-[#d94b1d] text-white text-sm font-bold transition-colors duration-200 cursor-pointer"
                            >
                                <RefreshCw size={16} />
                                <span>Tải lại trang</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    window.location.href = '/';
                                }}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#1E293B] text-sm font-bold transition-colors duration-200 cursor-pointer"
                            >
                                <Home size={16} />
                                <span>Về trang chủ</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
