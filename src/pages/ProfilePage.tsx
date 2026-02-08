import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProfileFromArweave } from '@/actions/fetchProfile';
import { editProfile, validateEditPermission } from '@/actions/editProfile';
import { useWallet } from '@/context/WalletContext';

type Status = 'loading' | 'success' | 'error';

function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { isConnected, address } = useWallet();

  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');
  const [html, setHtml] = useState('');
  const [version, setVersion] = useState<string | undefined>();

  // Arweave profile metadata — kept in state for edit flow
  const [txId, setTxId] = useState<string | undefined>();
  const [profileOwner, setProfileOwner] = useState<string | undefined>();
  const [profileUsername, setProfileUsername] = useState<string | undefined>();

  // Edit state
  const [isOwner, setIsOwner] = useState(false);
  const [editStatus, setEditStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [editError, setEditError] = useState('');

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

  // Check ownership whenever wallet or profile owner changes
  useEffect(() => {
    if (isConnected && address && profileOwner) {
      setIsOwner(address === profileOwner);
    } else {
      setIsOwner(false);
    }
  }, [isConnected, address, profileOwner]);

  // Edit handler — re-upload the current HTML as a new version
  const handleEdit = useCallback(async () => {
    if (!profileOwner || !profileUsername) return;

    setEditStatus('uploading');
    setEditError('');

    const result = await editProfile(html, profileUsername, profileOwner);

    if (result.success) {
      setEditStatus('done');
      if (result.txId) setTxId(result.txId);
    } else {
      setEditStatus('error');
      setEditError(result.error || 'Upload failed');
    }
  }, [html, profileOwner, profileUsername]);

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

  // Success — render profile HTML + owner toolbar
  const blob = new Blob([html], { type: 'text/html' });
  const blobUrl = URL.createObjectURL(blob);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Owner toolbar — only visible to profile owner */}
      {isOwner && (
        <div className="bg-gray-900 text-white px-4 py-2.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">You own this profile</span>
            {version && (
              <span className="text-xs text-gray-400">
                Last deployed: {new Date(version).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/editor')}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              Open Editor
            </button>
            <button
              onClick={handleEdit}
              disabled={editStatus === 'uploading'}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editStatus === 'uploading' ? 'Uploading...' : editStatus === 'done' ? 'Updated!' : 'Re-deploy'}
            </button>
          </div>
        </div>
      )}
      {editStatus === 'error' && editError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-700">
          {editError}
        </div>
      )}

      {/* Profile iframe */}
      <iframe
        ref={iframeRef}
        src={blobUrl}
        title={`${username}'s ReBento`}
        className="flex-1 w-full border-0"
        style={{ minHeight: isOwner ? 'calc(100vh - 48px)' : '100vh', display: 'block' }}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}

export default ProfilePage;
