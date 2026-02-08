import { useState, useRef } from 'react';
import { Image, Link, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCardContentProps {
  imageUrl?: string;
  caption?: string;
  onImageChange?: (url: string) => void;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ImageCardContent({
  imageUrl,
  caption,
  onImageChange,
  isEditing: externalIsEditing,
  onEditingChange,
}: ImageCardContentProps) {
  const [internalShowUrlInput, setInternalShowUrlInput] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Sync external editing state
  const showUrlInput = externalIsEditing ?? internalShowUrlInput;
  const setShowUrlInput = (value: boolean) => {
    setInternalShowUrlInput(value);
    onEditingChange?.(value);
  };
  const [urlValue, setUrlValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please select a PNG, JPEG, WebP, or GIF image');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 5MB');
      return;
    }

    // Convert to base64 data URL for local storage
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onImageChange?.(dataUrl);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = async () => {
    if (!urlValue.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      // Validate URL format
      new URL(urlValue);

      // Test if image loads
      await new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = urlValue;
      });

      onImageChange?.(urlValue);
      setShowUrlInput(false);
      setUrlValue('');
    } catch {
      setError('Invalid image URL or failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUrlSubmit();
    } else if (e.key === 'Escape') {
      setShowUrlInput(false);
      setUrlValue('');
      setError(null);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange?.('');
  };

  // Has an image - show it full bleed with optional caption overlay
  if (imageUrl) {
    return (
      <div className="relative h-full w-full overflow-hidden group/image">
        {/* Loading skeleton */}
        {isImageLoading && !hasError && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
        )}

        {/* Image */}
        {!hasError && (
          <img
            src={imageUrl}
            alt={caption || 'Image'}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300',
              isImageLoading ? 'opacity-0' : 'opacity-100'
            )}
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              setHasError(true);
              setIsImageLoading(false);
            }}
          />
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-2">
            <Image className="w-8 h-8 text-gray-400" />
            <span className="text-xs text-gray-500">Failed to load</span>
          </div>
        )}

        {/* Caption overlay - only show if caption exists */}
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <p className="text-sm font-medium text-white truncate">{caption}</p>
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={handleRemoveImage}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover/image:opacity-100 transition-opacity z-10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Empty state - upload or paste URL
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {showUrlInput ? (
        <div className="w-full max-w-xs">
          <div className="relative">
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              autoFocus
              placeholder="Paste image URL..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
          )}
          <div className="mt-3 flex gap-2 justify-center">
            <button
              onClick={handleUrlSubmit}
              disabled={isLoading || !urlValue.trim()}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Loading...' : 'Add'}
            </button>
            <button
              onClick={() => {
                setShowUrlInput(false);
                setUrlValue('');
                setError(null);
              }}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-3">
            <Image className="w-7 h-7 text-gray-400" />
          </div>

          {error && (
            <p className="mb-3 text-xs text-red-500 text-center">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload
            </button>
            <button
              onClick={() => setShowUrlInput(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
              URL
            </button>
          </div>

          <p className="mt-2 text-xs text-gray-400">PNG, JPEG, WebP, GIF</p>
        </>
      )}
    </div>
  );
}
