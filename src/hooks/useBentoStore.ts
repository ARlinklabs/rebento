import { useState, useCallback, useEffect } from 'react';
import type { BentoCard, CardSize, UserProfile, Theme, SocialPlatform, BentoImportData } from '@/types';

const generateId = () => Math.random().toString(36).substring(2, 9);

const STORAGE_KEY = 'rebento-store';

const defaultProfile: UserProfile = {
  name: 'Your Name',
  bio: 'Add your bio here...',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
  location: 'Your Location',
};

const defaultTheme: Theme = {
  backgroundColor: '#ffffff',
  accentColor: '#ec4899',
  isDarkMode: false,
};

const initialCards: BentoCard[] = [
  {
    id: generateId(),
    type: 'image',
    size: 'medium',
    title: 'Add title',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/1161/1161388.png',
  },
  {
    id: generateId(),
    type: 'map',
    size: 'medium',
    mapLocation: 'San Francisco',
  },
  {
    id: generateId(),
    type: 'social',
    size: 'medium',
    socialPlatform: 'threads',
    socialUsername: '@username',
  },
];

interface StoredState {
  cards: BentoCard[];
  profile: UserProfile;
  theme: Theme;
}

function loadFromStorage(): StoredState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

function saveToStorage(state: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors
  }
}

export const useBentoStore = () => {
  const stored = loadFromStorage();

  const [cards, setCards] = useState<BentoCard[]>(stored?.cards || initialCards);
  const [profile, setProfile] = useState<UserProfile>(stored?.profile || defaultProfile);
  const [theme, setTheme] = useState<Theme>(stored?.theme || defaultTheme);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isWidgetDrawerOpen, setIsWidgetDrawerOpen] = useState(false);
  const [devicePreview, setDevicePreview] = useState<'desktop' | 'mobile'>('desktop');
  const [isImporting, setIsImporting] = useState(false);

  // Persist to localStorage on changes
  useEffect(() => {
    saveToStorage({ cards, profile, theme });
  }, [cards, profile, theme]);

  const addCard = useCallback((type: BentoCard['type'], size: CardSize = 'medium') => {
    const newCard: BentoCard = {
      id: generateId(),
      type,
      size,
    };
    setCards((prev) => [...prev, newCard]);
    return newCard.id;
  }, []);

  const addSocialCard = useCallback((platform: SocialPlatform, username: string) => {
    const newCard: BentoCard = {
      id: generateId(),
      type: 'social',
      size: 'medium',
      socialPlatform: platform,
      socialUsername: username,
    };
    setCards((prev) => [...prev, newCard]);
    return newCard.id;
  }, []);

  const removeCard = useCallback((id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
    if (selectedCardId === id) {
      setSelectedCardId(null);
    }
  }, [selectedCardId]);

  const updateCard = useCallback((id: string, updates: Partial<BentoCard>) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  }, []);

  const updateCardSize = useCallback((id: string, size: CardSize) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, size } : card))
    );
  }, []);

  const reorderCards = useCallback((newOrder: BentoCard[]) => {
    setCards(newOrder);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateTheme = useCallback((updates: Partial<Theme>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setTheme((prev) => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  }, []);

  const importProfile = useCallback((data: BentoImportData) => {
    setCards(data.cards);
    setProfile(data.profile);
    setTheme(data.theme);
    setSelectedCardId(null);
  }, []);

  return {
    cards,
    profile,
    theme,
    selectedCardId,
    isWidgetDrawerOpen,
    devicePreview,
    isImporting,
    setSelectedCardId,
    setIsWidgetDrawerOpen,
    setDevicePreview,
    setIsImporting,
    addCard,
    addSocialCard,
    removeCard,
    updateCard,
    updateCardSize,
    reorderCards,
    updateProfile,
    updateTheme,
    toggleDarkMode,
    importProfile,
  };
};
