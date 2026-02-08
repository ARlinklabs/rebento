import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';

function PreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { html: string; sizeKB: number; isUnderLimit: boolean } | null;

  if (!state?.html) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <p className="text-gray-500">No preview data. Go back to the editor first.</p>
          <button
            onClick={() => navigate('/editor')}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Editor
          </button>
        </div>
      </div>
    );
  }

  const blob = new Blob([state.html], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => navigate('/editor')}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Editor
        </button>

        <div className="flex items-center gap-3">
          {state.isUnderLimit ? (
            <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <Check className="w-4 h-4" />
              <span>{state.sizeKB} KB — fits ArDrive free tier</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
              <AlertTriangle className="w-4 h-4" />
              <span>{state.sizeKB} KB — over 100 KB limit</span>
            </div>
          )}
        </div>
      </div>

      {/* iframe preview */}
      <div className="flex-1 p-4">
        <iframe
          src={blobUrl}
          title="ReBento Preview"
          className="w-full h-full rounded-xl border border-gray-200 bg-white shadow-lg"
          style={{ minHeight: 'calc(100vh - 80px)' }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}

export default PreviewPage;
