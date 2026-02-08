import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle, CheckCircle2, Download, User, LayoutGrid } from 'lucide-react';
import { fetchBentoProfile } from '@/lib/bentoImporter';
import type { BentoImportData } from '@/types';
import { cn } from '@/lib/utils';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: BentoImportData) => void;
  initialUrl?: string;
}

type ImportStep = 'input' | 'loading' | 'preview' | 'error';

export function ImportDialog({ isOpen, onClose, onImport, initialUrl }: ImportDialogProps) {
  const [url, setUrl] = useState(initialUrl || '');
  const [step, setStep] = useState<ImportStep>('input');
  const [error, setError] = useState('');
  const [importData, setImportData] = useState<BentoImportData | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) return;

    setStep('loading');
    setError('');

    try {
      const data = await fetchBentoProfile(url);
      setImportData(data);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import profile');
      setStep('error');
    }
  };

  const handleConfirmImport = () => {
    if (importData) {
      onImport(importData);
      onClose();
    }
  };

  const handleRetry = () => {
    setStep('input');
    setError('');
    setImportData(null);
  };

  const handleClose = () => {
    setUrl(initialUrl || '');
    setStep('input');
    setError('');
    setImportData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Import from Bento
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bento shuts down Feb 13 — save your profile
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            {/* Step: Input */}
            {step === 'input' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bento profile URL or username
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                      placeholder="bento.me/username"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-pink-400 transition-colors text-sm"
                      autoFocus
                    />
                    <button
                      onClick={handleFetch}
                      disabled={!url.trim()}
                      className={cn(
                        'px-6 py-3 rounded-xl font-medium text-sm text-white transition-all',
                        url.trim()
                          ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                          : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                      )}
                    >
                      Import
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Enter a Bento URL like bento.me/username or just the username
                  </p>
                </div>
              </div>
            )}

            {/* Step: Loading */}
            {step === 'loading' && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-10 h-10 text-pink-500" />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Fetching profile...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Importing from {url}
                  </p>
                </div>
              </div>
            )}

            {/* Step: Preview */}
            {step === 'preview' && importData && (
              <div className="space-y-4">
                {/* Profile Preview */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
                  <img
                    src={importData.profile.avatar}
                    alt={importData.profile.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-gray-100 truncate">
                      {importData.profile.name}
                    </p>
                    {importData.profile.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {importData.profile.bio}
                      </p>
                    )}
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Profile</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Found</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <LayoutGrid className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Cards</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {importData.cards.length} found
                      </p>
                    </div>
                  </div>
                </div>

                {/* Import Button */}
                <button
                  onClick={handleConfirmImport}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium text-sm transition-all"
                >
                  Import Profile to ReBento
                </button>
              </div>
            )}

            {/* Step: Error */}
            {step === 'error' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/10">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-400">
                      Import failed
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
