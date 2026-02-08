import { useState } from 'react';

interface SectionHeaderContentProps {
  content?: string;
  onUpdate?: (updates: { content: string }) => void;
}

export function SectionHeaderContent({ content, onUpdate }: SectionHeaderContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content || '');

  const handleSave = () => {
    onUpdate?.({ content: editContent });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="flex items-center h-full px-6 py-4">
      {isEditing ? (
        <input
          type="text"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          autoFocus
          className="w-full text-lg font-semibold bg-transparent outline-none border-b-2 border-pink-500 text-gray-900 dark:text-gray-100"
          placeholder="Section title..."
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full text-left text-lg font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          {content || 'Section Header'}
        </button>
      )}
    </div>
  );
}
