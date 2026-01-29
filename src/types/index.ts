export interface Post {
  id: string; // Globally unique ID: thread-X-floor-Y
  floorId: string; // The floor number/string within thread: "1L", "LZ"
  author: string;
  content: string;
  isLZ: boolean;
  timestamp?: string;
  threadId: string; // Reference to parent thread
  clientTail?: string;
  manualTimestamp?: string; // Extracted from "[...]" in the floor header
}

export interface Thread {
  id: string;
  title: string;
  posts: Post[];
}

export interface Theme {
  id: string;
  name: string;
  className: string;
  description: string;
  css?: string; // Content of the theme's CSS file
}

export type TimeMode = 'hidden' | 'random';

export interface TimeConfig {
  mode: TimeMode;
  startTime: string; // ISO string format preferred, or easy to parse "YYYY-MM-DD HH:mm"
  endTime: string;
}

export const DEFAULT_TIME_CONFIG: TimeConfig = {
  mode: 'random',
  startTime: '2025-01-01 09:00',
  endTime: '2025-01-01 23:00'
};

export const DEFAULT_THEME: Theme = {
  id: 'modern',
  name: '现代简约',
  className: 'theme-modern',
  description: '类似于知乎/贴吧的现代风格，干净整洁。'
};
