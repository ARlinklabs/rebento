import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useBentoStore } from '@/hooks/useBentoStore';
import { ProfileSection } from '@/components/bento/ProfileSection';
import { BentoGrid } from '@/components/bento/BentoGrid';
import { FloatingDock } from '@/components/bento/FloatingDock';
import { WidgetDrawer } from '@/components/bento/WidgetDrawer';
import { ThemePanel } from '@/components/bento/ThemePanel';
import { ImportDialog } from '@/components/bento/ImportDialog';
import { LoginModal } from '@/components/bento/LoginModal';
import { Toast } from '@/components/bento/Toast';
import { useAuth } from 'arlinkauth/react';
import { getPageHtml } from '@/actions/getHtml';
import { uploadHtmlToArweave } from '@/actions/uploadProfile';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import '@/App.css';

function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const importUrl = (location.state as any)?.importUrl as string | undefined;
  const claimedUsername = (location.state as any)?.claimedUsername as string | undefined;

  const {
    cards,
    profile,
    theme,
    selectedCardId,
    isWidgetDrawerOpen,
    devicePreview,
    setSelectedCardId,
    setIsWidgetDrawerOpen,
    setDevicePreview,
    addCard,
    addSocialCard,
    removeCard,
    updateCard,
    updateCardSize,
    reorderCards,
    updateProfile,
    updateTheme,
    toggleDarkMode,
    importProfile,
  } = useBentoStore();

  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const { isAuthenticated, user, client } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  // Auto-open import dialog if navigated with import URL
  useEffect(() => {
    if (importUrl) {
      setIsImportDialogOpen(true);
    }
  }, [importUrl]);

  // Prefill username if claimed from landing page
  useEffect(() => {
    if (claimedUsername) {
      updateProfile({ name: `@${claimedUsername}` });
    }
  }, [claimedUsername, updateProfile]);

  const doUpload = async () => {
    if (!client) return;
    setIsUploading(true);
    setToastType('info');
    setToastMessage('Generating page...');

    try {
      const { html } = await getPageHtml(profile, cards, theme);
      const username = profile.name.replace(/^@/, '').toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'anonymous';

      setToastMessage('Uploading to Arweave...');
      const result = await uploadHtmlToArweave(html, username, client, user?.arweave_address || '');

      if (result.success && result.txId) {
        const baseUrl = import.meta.env.VITE_BASE_URL || 'https://rebento_arlink.ar.io';
        const profileUrl = `${baseUrl}/${username}`;
        setDeployedUrl(profileUrl);
        setToastType('success');
        setToastMessage(`Deployed! Your page is live.`);
        // Fire confetti
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.7 } });
        setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } }), 250);
      } else {
        setToastType('error');
        setToastMessage(result.error || 'Upload failed');
      }
    } catch (err) {
      setToastType('error');
      setToastMessage('Upload failed. Try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleShare = () => {
    if (isAuthenticated && user) {
      doUpload();
      return;
    }
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (_addr: string) => {
    setIsLoginModalOpen(false);
    // User just logged in — trigger upload
    doUpload();
  };

  const handlePreview = async () => {
    setToastMessage('Generating preview...');
    const result = await getPageHtml(profile, cards, theme);
    navigate('/preview', { state: { html: result.html, sizeKB: result.sizeKB, isUnderLimit: result.isUnderLimit } });
  };

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-300',
        theme.isDarkMode && 'dark'
      )}
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <motion.div
        layout
        transition={{
          layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        }}
        className={cn(
          'mx-auto px-6 py-12 pb-32',
          devicePreview === 'mobile' ? 'max-w-md' : 'max-w-6xl'
        )}
      >
        <motion.div
          layout
          transition={{
            layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
          }}
          className={cn(
            'grid gap-12',
            devicePreview === 'mobile'
              ? 'grid-cols-1'
              : 'grid-cols-[320px_1fr]'
          )}
        >
          {/* Profile Section */}
          <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.5 },
              x: { duration: 0.5 },
            }}
            className={cn(devicePreview === 'mobile' && 'text-center')}
          >
            <ProfileSection
              profile={profile}
              onUpdate={updateProfile}
              isDarkMode={theme.isDarkMode}
            />
          </motion.div>

          {/* Bento Grid */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.5, delay: 0.2 },
              y: { duration: 0.5, delay: 0.2 },
            }}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Social Media // Contact me
            </h2>
            <BentoGrid
              cards={cards}
              selectedCardId={selectedCardId}
              onSelectCard={setSelectedCardId}
              onRemoveCard={removeCard}
              onUpdateCard={updateCard}
              onUpdateCardSize={updateCardSize}
              onReorderCards={reorderCards}
              onAddCard={addCard}
              onOpenWidgetDrawer={() => setIsWidgetDrawerOpen(true)}
              devicePreview={devicePreview}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating Dock */}
      <FloatingDock
        onShare={handleShare}
        onPreview={handlePreview}
        onThemeToggle={() => setIsThemePanelOpen(true)}
        onDeviceToggle={() =>
          setDevicePreview(devicePreview === 'desktop' ? 'mobile' : 'desktop')
        }
        onDarkModeToggle={toggleDarkMode}
        isDarkMode={theme.isDarkMode}
        devicePreview={devicePreview}
        accentColor={theme.accentColor}
        deployedUrl={deployedUrl}
        isUploading={isUploading}
      />

      {/* Widget Drawer */}
      <WidgetDrawer
        isOpen={isWidgetDrawerOpen}
        onClose={() => setIsWidgetDrawerOpen(false)}
        onSelect={addSocialCard}
      />

      {/* Theme Panel */}
      <ThemePanel
        isOpen={isThemePanelOpen}
        onClose={() => setIsThemePanelOpen(false)}
        backgroundColor={theme.backgroundColor}
        accentColor={theme.accentColor}
        onBackgroundColorChange={(color) => updateTheme({ backgroundColor: color })}
        onAccentColorChange={(color) => updateTheme({ accentColor: color })}
      />

      {/* Import Dialog */}
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={importProfile}
        initialUrl={importUrl}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Toast */}
      <Toast
        message={toastMessage || ''}
        isVisible={!!toastMessage}
        onClose={() => setToastMessage(null)}
        type={toastType}
      />

      {/* Click outside to deselect */}
      <AnimatePresence>
        {selectedCardId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCardId(null)}
            className="fixed inset-0 z-0"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default EditorPage;
