import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import EditorPage from '@/pages/EditorPage';
import PreviewPage from '@/pages/PreviewPage';
import ProfilePage from '@/pages/ProfilePage';

/**
 * On static hosts (Arweave), the manifest fallback may serve index.html
 * at "/" losing the original path. index.html captures it in sessionStorage
 * before React mounts. This component restores the redirect if needed.
 */
function SpaRedirect() {
  const saved = sessionStorage.getItem('spa-redirect');
  if (saved) {
    sessionStorage.removeItem('spa-redirect');
    return <Navigate to={saved} replace />;
  }
  return <LandingPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SpaRedirect />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/:username" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
