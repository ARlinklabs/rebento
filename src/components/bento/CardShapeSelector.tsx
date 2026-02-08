import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Pencil, Type } from 'lucide-react';
import type { CardSize } from '@/types';
import { cn } from '@/lib/utils';

interface CardShapeSelectorProps {
  currentSize: CardSize;
  onSizeChange: (size: CardSize) => void;
  onRemove: () => void;
  onEdit?: () => void;
  onCaptionChange?: (caption: string) => void;
  currentCaption?: string;
  isNarrow?: boolean;
}

const shapes: { size: CardSize; label: string }[] = [
  { size: 'small', label: 'Square' },
  { size: 'wide', label: 'Wide' },
  { size: 'tall', label: 'Tall' },
  { size: 'large', label: 'Large' },
];

function ShapeIcon({ size, active }: { size: CardSize; active: boolean }) {
  const fill = active ? 'currentColor' : 'none';
  const stroke = 'currentColor';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {size === 'small' && (
        <rect x="4" y="4" width="12" height="12" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      )}
      {size === 'wide' && (
        <rect x="2" y="6" width="16" height="8" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      )}
      {size === 'tall' && (
        <rect x="6" y="2" width="8" height="16" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      )}
      {size === 'large' && (
        <rect x="3" y="3" width="14" height="14" rx="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
      )}
    </svg>
  );
}

export function CardShapeSelector({
  currentSize,
  onSizeChange,
  onRemove,
  onEdit,
  onCaptionChange,
  currentCaption,
  isNarrow,
}: CardShapeSelectorProps) {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionValue, setCaptionValue] = useState(currentCaption || '');

  // For narrow cards (small, medium), use vertical layout to avoid cutoff
  const isVertical = isNarrow;

  const handleCaptionSave = () => {
    onCaptionChange?.(captionValue);
    setIsEditingCaption(false);
  };

  const handleCaptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCaptionSave();
    } else if (e.key === 'Escape') {
      setIsEditingCaption(false);
      setCaptionValue(currentCaption || '');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={cn(
          'absolute z-30 p-1 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border border-gray-200/80 dark:border-gray-700',
          isVertical
            ? 'right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5'
            : 'bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {shapes.map(({ size, label }) => (
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            className={cn(
              'p-1.5 rounded-lg transition-all duration-150',
              currentSize === size
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
            )}
            title={label}
          >
            <ShapeIcon size={size} active={currentSize === size} />
          </button>
        ))}
        <div className={cn(
          'bg-gray-200 dark:bg-gray-600',
          isVertical ? 'h-px w-5 my-0.5' : 'w-px h-5 mx-0.5'
        )} />
        {onCaptionChange && (
          <button
            onClick={() => setIsEditingCaption(true)}
            className={cn(
              'p-1.5 rounded-lg transition-all duration-150',
              currentCaption
                ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300'
            )}
            title={currentCaption ? 'Edit caption' : 'Add caption'}
          >
            <Type className="w-4 h-4" />
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all duration-150"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onRemove}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-150"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Caption input popup */}
      <AnimatePresence>
        {isEditingCaption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40 p-2 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={captionValue}
              onChange={(e) => setCaptionValue(e.target.value)}
              onKeyDown={handleCaptionKeyDown}
              onBlur={handleCaptionSave}
              autoFocus
              placeholder="Enter caption..."
              className="w-48 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
