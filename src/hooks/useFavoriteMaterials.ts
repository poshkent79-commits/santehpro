import { useState, useEffect, useCallback } from 'react';

const FAVORITES_STORAGE_KEY = 'santechpro_favorite_materials';
const FAVORITES_EVENT = 'santechpro_favorites_updated';

export const useFavoriteMaterials = () => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep state in sync with localStorage and custom events
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
        if (saved) {
          setFavoriteIds(JSON.parse(saved));
        } else {
          setFavoriteIds([]);
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener(FAVORITES_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const saveFavorites = useCallback((newFavorites: string[]) => {
    setFavoriteIds(newFavorites);
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: newFavorites }));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }, []);

  const isFavorite = useCallback(
    (id: string) => {
      return favoriteIds.includes(id);
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavoriteIds((prev) => {
        const exists = prev.includes(id);
        const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
        try {
          localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
          window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: next }));
        } catch (e) {
          console.error('Failed to toggle favorite', e);
        }
        return next;
      });
    },
    []
  );

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    saveFavorites,
  };
};
