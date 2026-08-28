import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = window.location.pathname;
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-stone-900">Ops! Algo inesperado aconteceu</h2>
              <p className="text-xs text-stone-500 leading-relaxed">
                Tivemos uma pequena instabilidade ao carregar a página. Não se preocupe, seus dados principais continuam seguros.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-stone-500" />
                <span>Limpar Cache e Reiniciar App</span>
              </button>

              {this.state.error && (
                <div className="pt-2 text-left">
                  <button
                    onClick={this.toggleDetails}
                    className="text-[11px] text-stone-400 hover:text-stone-600 flex items-center gap-1 mx-auto"
                  >
                    <span>Ver detalhes do erro</span>
                    {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-2 p-3 bg-stone-900 text-red-400 font-mono text-[10px] rounded-lg overflow-x-auto max-h-40 break-all select-all">
                      <p className="font-bold text-white mb-1">{this.state.error.name}: {this.state.error.message}</p>
                      {this.state.error.stack && (
                        <p className="text-stone-400 whitespace-pre-wrap">{this.state.error.stack}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
