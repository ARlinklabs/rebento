import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import type { BentoCard as BentoCardType, CardSize } from '@/types';
import { cn } from '@/lib/utils';
import { CardShapeSelector } from './CardShapeSelector';
import { SocialCardContent } from './SocialCardContent';
import { MapCardContent } from './MapCardContent';
import { ImageCardContent } from './ImageCardContent';
import { LinkCardContent } from './LinkCardContent';
import { SectionHeaderContent } from './SectionHeaderContent';

interface BentoCardProps {
  card: BentoCardType;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onSizeChange: (size: CardSize) => void;
  onUpdate: (updates: Partial<BentoCardType>) => void;
  dragHandleProps?: any;
}

const sizeClasses: Record<CardSize, string> = {
  small: 'col-span-1 row-span-2',
  medium: 'col-span-1 row-span-2',
  large: 'col-span-2 row-span-4',
  wide: 'col-span-2 row-span-2',
  tall: 'col-span-1 row-span-4',
};

export function BentoCard({
  card,
  isSelected,
  onSelect,
  onRemove,
  onSizeChange,
  onUpdate,
  dragHandleProps,
}: BentoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(card.content || '');
  const [editTitle] = useState(card.title || '');

  const handleSave = () => {
    onUpdate({ content: editContent, title: editTitle });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const renderContent = () => {
    switch (card.type) {
      case 'social':
        return (
          <SocialCardContent
            platform={card.socialPlatform}
            username={card.socialUsername}
          />
        );
      case 'map':
        return (
          <MapCardContent
            location={card.mapLocation}
            onLocationChange={(location) => onUpdate({ mapLocation: location })}
            isEditing={isEditing}
            onEditingChange={setIsEditing}
          />
        );
      case 'link':
        return (
          <LinkCardContent
            card={card}
            onMetadataLoaded={(metadata) => onUpdate(metadata)}
          />
        );
      case 'section-header':
        return (
          <SectionHeaderContent
            content={card.content}
            onUpdate={(updates) => onUpdate(updates)}
          />
        );
      case 'image':
        return (
          <ImageCardContent
            imageUrl={card.imageUrl}
            caption={card.caption}
            onImageChange={(url) => onUpdate({ imageUrl: url })}
            isEditing={isEditing}
            onEditingChange={setIsEditing}
          />
        );
      case 'text':
      default:
        return (
          <div className="flex flex-col h-full p-4">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                autoFocus
                className="flex-1 w-full resize-none bg-transparent outline-none text-sm"
                placeholder="Add text..."
              />
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 text-left text-sm text-gray-600 hover:text-gray-900"
              >
                {card.content || 'Add Text...'}
              </button>
            )}
          </div>
        );
    }
  };

  const showToolbar = (isHovered || isSelected) && card.type !== 'section-header';

  // Cards that support the edit button
  const canEdit = ['text', 'image', 'map'].includes(card.type);

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 },
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'relative group rounded-2xl border-2 transition-all duration-200 h-full',
        'bg-white dark:bg-gray-900',
        isSelected
          ? 'border-pink-400'
          : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700',
        card.type === 'section-header' ? 'col-span-full row-span-1' : sizeClasses[card.size]
      )}
      style={{
        ...(card.bgColor ? { backgroundColor: card.bgColor } : {}),
        boxShadow: isSelected
          ? '0 4px 12px rgba(236,72,153,0.15)'
          : '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      {/* Inner container with overflow hidden for content */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        {/* Card Content */}
        <div className="h-full">{renderContent()}</div>
      </div>

      {/* Drag Handle - outside overflow container */}
      <div
        {...dragHandleProps}
        className={cn(
          'absolute top-2 left-2 z-20 p-1.5 rounded-lg cursor-grab active:cursor-grabbing',
          'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          isSelected && 'opacity-100'
        )}
      >
        <GripVertical className="w-4 h-4 text-gray-500" />
      </div>

      {/* Shape Selector + Edit + Delete (on hover) - outside overflow container */}
      <AnimatePresence>
        {showToolbar && (
          <CardShapeSelector
            currentSize={card.size}
            onSizeChange={onSizeChange}
            onRemove={onRemove}
            onEdit={canEdit ? handleEdit : undefined}
            onCaptionChange={card.type === 'image' ? (caption) => onUpdate({ caption }) : undefined}
            currentCaption={card.type === 'image' ? card.caption : undefined}
            isNarrow={card.size === 'small' || card.size === 'medium'}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
