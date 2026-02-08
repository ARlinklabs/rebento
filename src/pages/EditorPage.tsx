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
import { useWallet } from '@/context/WalletContext';
import { getPageHtml } from '@/actions/getHtml';
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

  const { isConnected, address } = useWallet();

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

  const handleShare = () => {
    // If already connected, just copy the link
    if (isConnected && address) {
      console.log('Already connected:', address);
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setToastMessage('Link copied to clipboard!');
      return;
    }

    // Otherwise open login modal to connect wallet
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (addr: string) => {
    console.log('User logged in with address:', addr);
    setIsLoginModalOpen(false);

    // Copy link to clipboard and show toast
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setToastMessage('Link copied to clipboard!');
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
