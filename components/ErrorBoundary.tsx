

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Initialized state within the constructor to ensure `this.props` is correctly typed
  // and accessible. The class property approach was causing a type inference issue.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
          <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl border border-red-700">
            <h1 className="text-3xl font-bold text-red-500 mb-4">Ocorreu um erro</h1>
            <p className="text-gray-300 mb-6">Algo deu errado. Por favor, tente recarregar a página.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
