import { useState, useEffect } from 'react';

export interface ClientTailConfig {
  show: boolean;
  mode: 'random' | 'order';
  list: string[];
}

const DEFAULT_CONFIG: ClientTailConfig = {
  show: false,
  mode: 'random',
  list: ['来自 iPhone 16 Pro Max', '来自 Android 客户端', '来自 鸿蒙客户端']
};

export const useClientTails = () => {
  const [config, setConfig] = useState<ClientTailConfig>(() => {
    const saved = localStorage.getItem('client-tails-config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('client-tails-config', JSON.stringify(config));
  }, [config]);

  // Helper to get tail for a specific index (stable for render if mode is order, unpredictable if random but we want stability?)
  // If random, we should pre-generate or hash. 
  // Let's use a simple hash of (ThreadID + FloorID) to pick from list if mode is 'random', to keep it consistent on re-renders.
  const getTailForPost = (postId: string, floorIndex: number) => {
      if (!config.show || config.list.length === 0) return undefined;
      
      let index = 0;
      if (config.mode === 'order') {
          index = floorIndex % config.list.length;
      } else {
          // Pseudo-random based on postId string char codes
          const hash = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          index = hash % config.list.length;
      }
      
      return config.list[index];
  };

  return { config, setConfig, getTailForPost };
};
