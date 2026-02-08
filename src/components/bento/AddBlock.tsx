import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Link2, Image, Type, MapPin, LayoutGrid, SeparatorHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddBlockProps {
  onAdd: (type: 'text' | 'image' | 'map' | 'social' | 'link' | 'section-header') => void;
  onOpenWidgetDrawer: () => void;
}

const blockTypes = [
  { type: 'link' as const, icon: Link2, label: 'Link', color: 'bg-blue-500' },
  { type: 'image' as const, icon: Image, label: 'Image', color: 'bg-green-500' },
  { type: 'text' as const, icon: Type, label: 'Text', color: 'bg-gray-700' },
  { type: 'map' as const, icon: MapPin, label: 'Map', color: 'bg-red-500' },
  { type: 'section-header' as const, icon: SeparatorHorizontal, label: 'Header', color: 'bg-amber-500' },
  { type: 'widget' as const, icon: LayoutGrid, label: 'Widget', color: 'bg-purple-500' },
];

export function AddBlock({ onAdd, onOpenWidgetDrawer }: AddBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeClick = (type: string) => {
    if (type === 'widget') {
      onOpenWidgetDrawer();
    } else {
      onAdd(type as 'text' | 'image' | 'map' | 'social' | 'link' | 'section-header');
    }
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      {/* Add Block Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'w-full py-8 rounded-3xl border-2 border-dashed transition-all duration-300',
          'flex flex-col items-center justify-center gap-2',
          isExpanded
            ? 'border-pink-400 bg-pink-50 dark:bg-pink-900/10'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        )}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isExpanded
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          )}
        >
          <Plus className="w-5 h-5" />
        </motion.div>
        <span
          className={cn(
            'text-sm font-medium',
            isExpanded
              ? 'text-pink-600 dark:text-pink-400'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Add a block
        </span>
      </motion.button>

      {/* Expanded Menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50"
          >
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
              {blockTypes.map(({ type, icon: Icon, label, color }, index) => (
                <motion.button
                  key={type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleTypeClick(type)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors min-w-[64px]"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-white',
                      color
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
