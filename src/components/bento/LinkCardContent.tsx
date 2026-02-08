import { useState, useEffect } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import type { BentoCard } from '@/types';
import { fetchOGMetadata } from '@/lib/ogFetcher';
import { cn } from '@/lib/utils';

interface LinkCardContentProps {
  card: BentoCard;
  onMetadataLoaded?: (metadata: { linkImage?: string; linkTitle?: string; linkDescription?: string; linkFavicon?: string }) => void;
}

function ImageWithLoading({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn('relative', className)}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse" />
      )}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
          <Globe className="w-8 h-8 text-gray-400" />
        </div>
      )}
    </div>
  );
}

export function LinkCardContent({ card, onMetadataLoaded }: LinkCardContentProps) {
  const [ogData, setOgData] = useState<{
    image?: string;
    title?: string;
    description?: string;
    favicon?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const displayUrl = card.linkUrl?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') || '';

  // Fetch OG metadata if we don't have a preview image
  useEffect(() => {
    if (!card.linkImage && card.linkUrl && !ogData && !isLoading) {
      setIsLoading(true);
      fetchOGMetadata(card.linkUrl)
        .then((metadata) => {
          if (metadata) {
            setOgData({
              image: metadata.image,
              title: metadata.title,
              description: metadata.description,
              favicon: metadata.favicon,
            });
            // Notify parent to persist metadata
            if (metadata.image || metadata.title) {
              onMetadataLoaded?.({
                linkImage: metadata.image,
                linkTitle: metadata.title,
                linkDescription: metadata.description,
                linkFavicon: metadata.favicon,
              });
            }
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [card.linkUrl, card.linkImage]);

  // Use card data first, fall back to fetched OG data
  const previewImage = card.linkImage || ogData?.image;
  const title = card.linkTitle || ogData?.title || card.title;
  const description = card.linkDescription || ogData?.description;
  const favicon = card.linkFavicon || ogData?.favicon;

  // Loading skeleton
  if (isLoading && !previewImage) {
    return (
      <div className="flex flex-col h-full animate-pulse">
        <div className="flex-1 bg-gray-100 dark:bg-gray-800" />
        <div className="p-3 flex items-center gap-2 min-h-[44px]">
          <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        </div>
      </div>
    );
  }

  // Full-bleed image link card
  if (previewImage) {
    return (
      <a
        href={card.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col h-full"
      >
        <ImageWithLoading
          src={previewImage}
          alt={title || 'Link preview'}
          className="flex-1 overflow-hidden"
        />
        <div className="p-3 flex items-center gap-2 min-h-[44px]">
          {favicon ? (
            <img
              src={favicon}
              alt=""
              className="w-4 h-4 rounded-sm flex-shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
          )}
          <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
            {title || displayUrl}
          </span>
          <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
        </div>
      </a>
    );
  }

  // Simple link card without image
  return (
    <a
      href={card.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex flex-col items-center justify-center h-full p-4 gap-3"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        {favicon ? (
          <img
            src={favicon}
            alt=""
            className="w-6 h-6 rounded-sm"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <Globe className="w-6 h-6 text-gray-500" />
        )}
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
          {title || displayUrl || 'Link'}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {description}
          </p>
        )}
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
    </a>
  );
}
