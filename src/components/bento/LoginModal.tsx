import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (address: string) => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const { isConnected, isConnecting, address, error, connect } = useWallet();

  // Trigger connect when modal opens
  useEffect(() => {
    if (isOpen && !isConnected && !isConnecting) {
      connect();
    }
  }, [isOpen, isConnected, isConnecting, connect]);

  // Handle successful connection
  useEffect(() => {
    if (isOpen && isConnected && address) {
      // Brief delay to show success state
      const timer = setTimeout(() => {
        onLoginSuccess(address);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isConnected, address, onLoginSuccess]);

  const handleRetry = () => {
    connect();
  };

  // Determine display status
  const status = isConnected ? 'success' : error ? 'error' : isConnecting ? 'connecting' : 'idle';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal - centered */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className="w-full max-w-md"
            >
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-4">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Share your Rebento
                  </h2>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">
                    Connect your Arweave wallet to publish
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 pb-8">
                  <div className="flex flex-col items-center py-8">
                    {status === 'idle' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                          <Wallet className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-6 max-w-xs">
                          Sign in with Wander to permanently store your Rebento on Arweave
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Initializing Wander Connect...</span>
                        </div>
                      </motion.div>
                    )}

                    {status === 'connecting' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse">
                          <Wallet className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-center text-gray-900 dark:text-white font-medium mb-2">
                          Connecting...
                        </p>
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                          Please approve the connection in Wander
                        </p>
                      </motion.div>
                    )}

                    {status === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                          <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-center text-gray-900 dark:text-white font-medium">
                          Connected successfully!
                        </p>
                        {address && (
                          <p className="text-center text-gray-500 dark:text-gray-400 text-xs mt-2 font-mono">
                            {address.slice(0, 8)}...{address.slice(-6)}
                          </p>
                        )}
                      </motion.div>
                    )}

                    {status === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                          <X className="w-10 h-10 text-white" />
                        </div>
                        <p className="text-center text-gray-900 dark:text-white font-medium mb-2">
                          Connection failed
                        </p>
                        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                          {error || 'Something went wrong'}
                        </p>
                        <button
                          onClick={handleRetry}
                          className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                        >
                          Try again
                        </button>
                      </motion.div>
                    )}
                  </div>

                  {/* Footer info */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-center text-gray-400">
                      Powered by Arweave - permanent, decentralized storage
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
