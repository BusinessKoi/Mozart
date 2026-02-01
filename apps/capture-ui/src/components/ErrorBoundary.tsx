import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
                    <div className="bg-red-900/20 border border-red-700 p-6 rounded-lg max-w-md text-center">
                        <h1 className="text-xl font-bold text-red-500 mb-2">Something went wrong.</h1>
                        <p className="text-sm text-gray-300 mb-4">The application encountered a critical error.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 transition"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
