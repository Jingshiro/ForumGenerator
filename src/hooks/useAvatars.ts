import { useState, useEffect, useCallback } from 'react';
import { AvatarConfig } from '../types';

const DEFAULT_CONFIG: AvatarConfig = {
  show: false,
  mode: 'random',
  list: []
};

export const useAvatars = () => {
    const [config, setConfig] = useState<AvatarConfig>(() => {
        const saved = localStorage.getItem('forum_avatar_config');
        return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    });

    useEffect(() => {
        localStorage.setItem('forum_avatar_config', JSON.stringify(config));
    }, [config]);

    // Helper to get avatar for a specific author
    const getAvatarForAuthor = useCallback((authorName: string, _floorIndex: number, specificAvatar?: string) => {
        // 1. Specific avatar always wins
        if (specificAvatar) return specificAvatar;

        // 2. If feature disabled or list empty
        if (!config.show || config.list.length === 0) return undefined;

        // 3. Resolve from list based on mode
        let index = 0;
        if (config.mode === 'order') {
            const hash = authorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            index = hash % config.list.length;
        } else {
             // Random Mode
             const hash = authorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
             index = (hash * 13) % config.list.length;
        }

        return config.list[index];
    }, [config]);

    return { config, setConfig, getAvatarForAuthor };
};
