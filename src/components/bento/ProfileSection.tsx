import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin } from 'lucide-react';
import type { UserProfile } from '@/types';
import { cn } from '@/lib/utils';

interface ProfileSectionProps {
  profile: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => void;
  isDarkMode: boolean;
}

export function ProfileSection({ profile, onUpdate, isDarkMode }: ProfileSectionProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSave = () => {
    onUpdate({ name: editName });
    setIsEditingName(false);
  };

  const handleBioSave = () => {
    onUpdate({ bio: editBio });
    setIsEditingBio(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, save: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      save();
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      // Convert to base64 and update avatar
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdate({ avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  return (
    <div className="flex flex-col items-start space-y-6">
      {/* Avatar */}
      <div className="relative group">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={cn(
            'w-32 h-32 rounded-full overflow-hidden border-4 transition-colors',
            isDarkMode ? 'border-gray-800' : 'border-white',
            'shadow-lg'
          )}
        >
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
        <button
          onClick={handleAvatarClick}
          className={cn(
            'absolute bottom-0 right-0 p-2.5 rounded-full shadow-lg',
            'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Name */}
      <div className="w-full">
        {isEditingName ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleNameSave)}
            onBlur={handleNameSave}
            autoFocus
            className={cn(
              'w-full text-3xl font-bold bg-transparent outline-none border-b-2',
              'border-pink-500 text-gray-900 dark:text-gray-100'
            )}
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className={cn(
              'text-3xl font-bold text-left',
              'text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
            )}
          >
            {profile.name}
          </button>
        )}
      </div>

      {/* Bio */}
      <div className="w-full">
        {isEditingBio ? (
          <textarea
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleBioSave)}
            onBlur={handleBioSave}
            autoFocus
            rows={3}
            className={cn(
              'w-full resize-none bg-transparent outline-none border-b-2',
              'border-pink-500 text-gray-600 dark:text-gray-400 text-lg'
            )}
          />
        ) : (
          <button
            onClick={() => setIsEditingBio(true)}
            className={cn(
              'text-left text-lg leading-relaxed',
              'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors'
            )}
          >
            {profile.bio}
          </button>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-500">
        <MapPin className="w-4 h-4" />
        <span className="text-sm">{profile.location}</span>
      </div>
    </div>
  );
}
