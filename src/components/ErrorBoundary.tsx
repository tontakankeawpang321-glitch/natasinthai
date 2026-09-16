import { Component, ReactNode, ErrorInfo } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-body">
          <div className="max-w-md w-full bg-white rounded-3xl border border-amber-200 shadow-xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold font-display text-slate-900">
              ระบบกำลังเริ่มต้นใหม่
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ระบบตรวจพบข้อมูลขัดข้องชั่วคราว คุณสามารถกดปุ่มด้านล่างเพื่อรีเฟรชข้อมูลและใช้งานต่อได้ทันที
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-mono text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold font-display text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตและโหลดแอปพลิเคชันใหม่</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
