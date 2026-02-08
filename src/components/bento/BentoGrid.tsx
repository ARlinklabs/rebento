import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import type { BentoCard as BentoCardType, CardSize } from '@/types';
import { BentoCard as BentoCardComponent } from './BentoCard';
import { AddBlock } from './AddBlock';
import { cn } from '@/lib/utils';

interface SortableBentoCardProps {
  card: BentoCardType;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onSizeChange: (size: CardSize) => void;
  onUpdate: (updates: Partial<BentoCardType>) => void;
}

function SortableBentoCard({
  card,
  isSelected,
  onSelect,
  onRemove,
  onSizeChange,
  onUpdate,
}: SortableBentoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const sizeClasses: Record<CardSize, string> = {
    small: 'col-span-1 row-span-2',
    medium: 'col-span-1 row-span-2',
    large: 'col-span-2 row-span-4',
    wide: 'col-span-2 row-span-2',
    tall: 'col-span-1 row-span-4',
  };

  const gridClass = card.type === 'section-header'
    ? 'col-span-full row-span-1'
    : sizeClasses[card.size];

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <motion.div
      ref={setNodeRef}
      layout
      transition={{
        layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      }}
      style={style}
      className={cn(gridClass, 'h-full', isDragging && 'opacity-50')}
    >
      <BentoCardComponent
        card={card}
        isSelected={isSelected}
        onSelect={onSelect}
        onRemove={onRemove}
        onSizeChange={onSizeChange}
        onUpdate={onUpdate}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </motion.div>
  );
}

interface BentoGridProps {
  cards: BentoCardType[];
  selectedCardId: string | null;
  onSelectCard: (id: string | null) => void;
  onRemoveCard: (id: string) => void;
  onUpdateCard: (id: string, updates: Partial<BentoCardType>) => void;
  onUpdateCardSize: (id: string, size: CardSize) => void;
  onReorderCards: (cards: BentoCardType[]) => void;
  onAddCard: (type: BentoCardType['type']) => void;
  onOpenWidgetDrawer: () => void;
  devicePreview: 'desktop' | 'mobile';
}

export function BentoGrid({
  cards,
  selectedCardId,
  onSelectCard,
  onRemoveCard,
  onUpdateCard,
  onUpdateCardSize,
  onReorderCards,
  onAddCard,
  onOpenWidgetDrawer,
  devicePreview,
}: BentoGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = cards.findIndex((card) => card.id === active.id);
      const newIndex = cards.findIndex((card) => card.id === over.id);
      onReorderCards(arrayMove(cards, oldIndex, newIndex));
    }

    setActiveId(null);
  };

  const activeCard = cards.find((card) => card.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        layout
        transition={{
          layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
        }}
        className={cn(
          'grid gap-[20px]',
          devicePreview === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
        )}
        style={{ gridAutoRows: '80px', gridAutoFlow: 'dense' }}
        onClick={() => onSelectCard(null)}
      >
        <SortableContext
          items={cards.map((c) => c.id)}
          strategy={rectSortingStrategy}
        >
          {cards.map((card) => (
            <SortableBentoCard
              key={card.id}
              card={card}
              isSelected={selectedCardId === card.id}
              onSelect={() => onSelectCard(card.id)}
              onRemove={() => onRemoveCard(card.id)}
              onSizeChange={(size) => onUpdateCardSize(card.id, size)}
              onUpdate={(updates) => onUpdateCard(card.id, updates)}
            />
          ))}
        </SortableContext>

        {/* Add Block */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
          className={cn(
            devicePreview === 'mobile' ? 'col-span-2' : 'col-span-4'
          )}
        >
          <AddBlock onAdd={onAddCard} onOpenWidgetDrawer={onOpenWidgetDrawer} />
        </motion.div>
      </motion.div>

      <DragOverlay>
        {activeCard ? (
          <motion.div
            initial={{ scale: 1.05 }}
            animate={{ scale: 1.05 }}
            className="opacity-80"
          >
            <BentoCardComponent
              card={activeCard}
              isSelected={false}
              onSelect={() => {}}
              onRemove={() => {}}
              onSizeChange={() => {}}
              onUpdate={() => {}}
            />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
