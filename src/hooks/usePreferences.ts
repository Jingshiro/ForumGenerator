import { useState, useEffect } from 'react';
import { DEFAULT_THEME, Theme, TimeConfig, DEFAULT_TIME_CONFIG } from '../types';
import { INITIAL_CONTENT } from '../utils/parser';

// Import CSS content using Vite's ?inline query
import modernCss from '../theme/modern.css?inline';
import ancientCss from '../theme/ancient.css?inline';
import fantasyCss from '../theme/fantasy.css?inline';
import campusCss from '../theme/campus.css?inline';
import neumorphismCss from '../theme/neumorphism.css?inline';

export const usePreferences = () => {
  // Load content from localStorage or default
  const [content, setContent] = useState(() => {
    return localStorage.getItem('forum_content') || INITIAL_CONTENT;
  });

  const [themeId, setThemeId] = useState(DEFAULT_THEME.id);
  const [customCss, setCustomCss] = useState(() => {
     return localStorage.getItem('forum_custom_css') || '';
  });

  const [timeConfig, setTimeConfig] = useState<TimeConfig>(() => {
      const stored = localStorage.getItem('forum_time_config');
      if (stored) {
          try {
              return JSON.parse(stored);
          } catch (e) { console.error('Failed to parse time config', e); }
      }
      return DEFAULT_TIME_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('forum_content', content);
  }, [content]);

  useEffect(() => {
    localStorage.setItem('forum_custom_css', customCss);
  }, [customCss]);

  useEffect(() => {
    localStorage.setItem('forum_time_config', JSON.stringify(timeConfig));
  }, [timeConfig]);

  return {
    content,
    setContent,
    themeId,
    setThemeId,
    customCss,
    setCustomCss,
    timeConfig,
    setTimeConfig
  };
};

export const THEMES: Theme[] = [
  {
    ...DEFAULT_THEME,
    css: modernCss
  },
  {
    id: 'classic',
    name: '古风修仙',
    className: 'theme-classic',
    description: '纸墨风格，适合修仙、武侠题材。',
    css: ancientCss
  },
  {
    id: 'fantasy',
    name: '西幻传说',
    className: 'theme-fantasy',
    description: '暗夜鎏金风格，适合奇幻、史诗题材。',
    css: fantasyCss
  },
  {
    id: 'campus',
    name: '青春校园',
    className: 'theme-campus',
    description: '清新笔记风格，适合校园、日常题材。',
    css: campusCss
  },
  {
    id: 'neumorphism',
    name: '新拟态',
    className: 'theme-neumorphism',
    description: '柔和光影风格，现代、极简。',
    css: neumorphismCss
  }
];
