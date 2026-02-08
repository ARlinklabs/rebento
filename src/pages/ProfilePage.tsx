import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProfileFromArweave } from '@/actions/fetchProfile';
import { useAuth } from 'arlinkauth/react';

type Status = 'loading' | 'success' | 'error';

function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, client } = useAuth();

  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [html, setHtml] = useState('');
  const [version, setVersion] = useState<string | undefined>();

  // Arweave profile metadata
  const [txId, setTxId] = useState<string | undefined>();
  const [profileOwner, setProfileOwner] = useState<string | undefined>();
  const [profileUsername, setProfileUsername] = useState<string | undefined>();

  // Edit state
  const [isOwner, setIsOwner] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch profile on mount
  useEffect(() => {
    if (!username) {
      setStatus('error');
      setError('No username provided');
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await fetchProfileFromArweave(username);
      if (cancelled) return;

      if (result.success && result.html) {
        setHtml(result.html);
        setVersion(result.version);
        setTxId(result.txId);
        setProfileOwner(result.owner);
        setProfileUsername(result.username);
        setStatus('success');
      } else {
        setError(result.error || 'Profile not found');
        setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, [username]);

  // Check ownership whenever auth or profile owner changes
  useEffect(() => {
    if (isAuthenticated && user?.arweave_address && profileOwner) {
      setIsOwner(user.arweave_address === profileOwner);
    } else {
      setIsOwner(false);
    }
  }, [isAuthenticated, user, profileOwner]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-gray-900"
              style={{ animation: 'spin 0.8s linear infinite' }}
            />
          </div>
          <p className="text-sm text-gray-500 font-medium">
            Loading <span className="text-gray-900">@{username}</span>
          </p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center px-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Profile not found</h1>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Success
  const blob = new Blob([html], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);

  return (
    <div className="min-h-screen bg-white">
      <iframe
        ref={iframeRef}
        src={blobUrl}
        title={`${username}'s ReBento`}
        className="w-full border-0"
        style={{ height: '100vh', display: 'block' }}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />

      {/* Owner floating dock */}
      {isOwner && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl border border-gray-200"
        >
          <button
            onClick={() => navigate('/editor')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
