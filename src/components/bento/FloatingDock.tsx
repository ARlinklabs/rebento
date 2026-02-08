import { motion } from 'framer-motion';
import {
  Share2,
  Eye,
  Monitor,
  Smartphone,
  Moon,
  Sun,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingDockProps {
  onShare: () => void;
  onPreview: () => void;
  onThemeToggle: () => void;
  onDeviceToggle: () => void;
  onDarkModeToggle: () => void;
  isDarkMode: boolean;
  devicePreview: 'desktop' | 'mobile';
  accentColor: string;
}

export function FloatingDock({
  onShare,
  onPreview,
  onThemeToggle,
  onDeviceToggle,
  onDarkModeToggle,
  isDarkMode,
  devicePreview,
  accentColor,
}: FloatingDockProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', damping: 20 }}
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
        'flex items-center gap-2 p-2 rounded-2xl',
        'bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl',
        'shadow-2xl border border-gray-200 dark:border-gray-800'
      )}
    >
      {/* Share Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onShare}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white transition-colors"
        style={{ backgroundColor: accentColor }}
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm">Share my ReBento</span>
      </motion.button>

      <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

      {/* Preview Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPreview}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm">Preview</span>
      </motion.button>

      <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />

      {/* Device Toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => devicePreview !== 'desktop' && onDeviceToggle()}
          className={cn(
            'p-2 rounded-lg transition-colors',
            devicePreview === 'desktop'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <Monitor className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => devicePreview !== 'mobile' && onDeviceToggle()}
          className={cn(
            'p-2 rounded-lg transition-colors',
            devicePreview === 'mobile'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <Smartphone className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onThemeToggle}
        className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Palette className="w-4 h-4" />
      </motion.button>

      {/* Dark Mode Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDarkModeToggle}
        className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        {isDarkMode ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </motion.button>
    </motion.div>
  );
}
