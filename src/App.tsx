import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import EditorPage from '@/pages/EditorPage';
import PreviewPage from '@/pages/PreviewPage';
import ProfilePage from '@/pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/preview" element={<PreviewPage />} />
        <Route path="/:username" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
