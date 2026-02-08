import type { SocialPlatform } from '@/types';
import { cn } from '@/lib/utils';
import {
  Twitter,
  Youtube,
  Instagram,
  Github,
  Linkedin,
  Dribbble,
  Globe,
} from 'lucide-react';

interface SocialCardContentProps {
  platform?: SocialPlatform;
  username?: string;
}

const platformConfig: Record<
  SocialPlatform,
  { icon: React.ReactNode; bgColor: string; textColor: string; label: string }
> = {
  twitter: {
    icon: <Twitter className="w-6 h-6" />,
    bgColor: 'bg-black',
    textColor: 'text-white',
    label: 'X / Twitter',
  },
  youtube: {
    icon: <Youtube className="w-6 h-6" />,
    bgColor: 'bg-red-600',
    textColor: 'text-white',
    label: 'YouTube',
  },
  instagram: {
    icon: <Instagram className="w-6 h-6" />,
    bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    textColor: 'text-white',
    label: 'Instagram',
  },
  github: {
    icon: <Github className="w-6 h-6" />,
    bgColor: 'bg-gray-900',
    textColor: 'text-white',
    label: 'GitHub',
  },
  linkedin: {
    icon: <Linkedin className="w-6 h-6" />,
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    label: 'LinkedIn',
  },
  threads: {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.802-1.063-.689-1.685-1.74-1.752-2.96-.065-1.18.408-2.256 1.33-3.03.88-.74 2.084-1.088 3.48-.98.423.033.853.108 1.283.222a6.44 6.44 0 00-.315-1.052c-.365-.89-1.093-1.516-2.095-1.76-.973-.237-1.987.023-2.76.72-.78.7-1.207 1.68-1.207 2.76 0 .803.246 1.535.72 2.118.47.577 1.13.98 1.913 1.152l-.516 1.918c-1.146-.27-2.1-.88-2.79-1.76-.693-.887-1.074-1.98-1.074-3.168 0-1.56.617-3.004 1.74-4.068 1.12-1.06 2.58-1.55 4.15-1.34 1.72.23 3.02 1.28 3.68 2.97.46 1.16.62 2.56.49 4.18h.02c.768.46 1.392 1.09 1.82 1.85.84 1.48.88 3.38-.1 4.88-1.04 1.58-3.18 2.55-6.02 2.73l-.18.01zM14.756 9.63c-.68-.04-1.24.12-1.66.47-.41.34-.62.8-.62 1.35 0 .55.21 1.01.62 1.36.42.35.98.51 1.66.47.69-.04 1.25-.27 1.63-.67.38-.4.57-.91.57-1.5 0-.58-.19-1.08-.57-1.48-.38-.41-.94-.64-1.63-.67v-.03z" />
      </svg>
    ),
    bgColor: 'bg-black',
    textColor: 'text-white',
    label: 'Threads',
  },
  behance: {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.574 6.988h-6.466v-14.967h6.953c5.476.081 5.58 5.444 2.72 6.906 3.461 1.26 3.577 8.061-3.207 8.061zm-3.466-8.988h3.584c2.508 0 2.906-3-.312-3h-3.272v3zm3.391 3h-3.391v3.016h3.341c3.055 0 2.868-3.016.05-3.016z" />
      </svg>
    ),
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    label: 'Behance',
  },
  dribbble: {
    icon: <Dribbble className="w-6 h-6" />,
    bgColor: 'bg-pink-500',
    textColor: 'text-white',
    label: 'Dribbble',
  },
  pinterest: {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
      </svg>
    ),
    bgColor: 'bg-red-600',
    textColor: 'text-white',
    label: 'Pinterest',
  },
  paypal: {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 3.72a.77.77 0 01.757-.629h6.724c2.838 0 5.098.835 5.964 2.45.654 1.208.768 2.57.336 3.986-.617 2.042-2.175 3.453-4.073 3.825.387.207.747.478 1.07.81 1.303 1.358 1.588 3.338.717 5.21l-.023.047c-.09.18-.184.355-.283.524-.566.93-1.402 1.668-2.416 2.146-1.152.545-2.535.818-4.112.818H8.173a.75.75 0 01-.75-.633l-.347-2.52zm4.284-9.97c.14 0 .279.01.416.03.74.106 1.345.408 1.79.892.442.48.683 1.096.713 1.79l.002.09c-.003.074-.01.148-.02.22-.104.76-.44 1.38-.99 1.842-.552.463-1.243.7-2.054.7h-.03c-.08 0-.16-.003-.24-.01a2.54 2.54 0 01-1.44-.59 2.38 2.38 0 01-.85-1.44l-.02-.11c-.04-.28-.02-.56.06-.83l.56-2.24h2.103zm2.537-3.36c.1-.02.2-.03.3-.03.07 0 .14.003.21.01.66.09 1.2.35 1.6.77.4.42.62.96.65 1.58l.002.1c-.003.06-.01.12-.02.18-.09.66-.38 1.2-.85 1.6-.47.4-1.06.61-1.75.63h-.03c-.07 0-.14-.003-.21-.01-.63-.09-1.15-.35-1.54-.78-.39-.43-.6-.97-.63-1.6l-.002-.09c.003-.06.01-.12.02-.18l.6-2.4h.643v.26z" />
      </svg>
    ),
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    label: 'PayPal',
  },
  telegram: {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    bgColor: 'bg-sky-500',
    textColor: 'text-white',
    label: 'Telegram',
  },
  contra: {
    icon: <Globe className="w-6 h-6" />,
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    label: 'Contra',
  },
  layers: {
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    bgColor: 'bg-indigo-500',
    textColor: 'text-white',
    label: 'Layers',
  },
};

export function SocialCardContent({
  platform = 'twitter',
  username = '@username',
}: SocialCardContentProps) {
  const config = platformConfig[platform] || platformConfig.twitter;

  return (
    <div className="flex flex-col h-full p-4">
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
          config.bgColor,
          config.textColor
        )}
      >
        {config.icon}
      </div>
      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">
        {username}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {config.label}
      </p>
      <button
        className={cn(
          'mt-auto px-4 py-2 rounded-full text-xs font-medium transition-colors',
          'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90'
        )}
      >
        Follow
      </button>
    </div>
  );
}
