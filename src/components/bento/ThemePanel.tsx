import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
  backgroundColor: string;
  accentColor: string;
  onBackgroundColorChange: (color: string) => void;
  onAccentColorChange: (color: string) => void;
}

const backgroundColors = [
  '#ffffff',
  '#f8fafc',
  '#f1f5f9',
  '#fef7ed',
  '#fef2f2',
  '#f0fdf4',
  '#eff6ff',
  '#faf5ff',
  '#0f172a',
  '#1e293b',
  '#18181b',
  '#000000',
];

const accentColors = [
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ef4444',
  '#14b8a6',
  '#f43f5e',
];

export function ThemePanel({
  isOpen,
  onClose,
  backgroundColor,
  accentColor,
  onBackgroundColorChange,
  onAccentColorChange,
}: ThemePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Theme
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Background Color */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Background Color
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {backgroundColors.map((color) => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onBackgroundColorChange(color)}
                      className={cn(
                        'w-12 h-12 rounded-xl border-2 transition-all',
                        backgroundColor === color
                          ? 'border-pink-500 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}
                      style={{ backgroundColor: color }}
                    >
                      {backgroundColor === color && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={cn(
                            'w-3 h-3 rounded-full mx-auto',
                            color === '#ffffff' || color === '#f8fafc' || color === '#f1f5f9'
                              ? 'bg-gray-900'
                              : 'bg-white'
                          )}
                        />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Accent Color
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {accentColors.map((color) => (
                    <motion.button
                      key={color}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onAccentColorChange(color)}
                      className={cn(
                        'w-10 h-10 rounded-full transition-all',
                        accentColor === color
                          ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white'
                          : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-300 dark:hover:ring-gray-600'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Preview
                </h3>
                <div
                  className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor }}
                >
                  <div className="space-y-3">
                    <div
                      className="h-8 w-24 rounded-lg"
                      style={{ backgroundColor: accentColor }}
                    />
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
