import { Component } from 'react';

// WHY a class component?
// Error boundaries MUST be class components in React.
// There is no hook equivalent for componentDidCatch.
// This is one of the very few remaining valid uses of class components.

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="text-5xl mb-6">⚠️</div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                            An unexpected error occurred. This has been logged and we will look into it.
                        </p>
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-6 text-left">
                            <p className="text-red-700 text-xs font-mono break-all">
                                {this.state.error?.message || 'Unknown error'}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                this.setState({ hasError: false, error: null });
                                window.location.href = '/';
                            }}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            Go to homepage
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;