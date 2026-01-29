import React, { useMemo } from 'react';
import { Thread, Theme } from '../types';
import { PostItem } from './PostItem';
import clsx from 'clsx';
import { parseMarkdownToThreads } from '../utils/parser';

interface PreviewProps {
  content: string;
  theme: Theme;
  activeThreadId: string;
  onThreadChange: (threadId: string) => void;
  onThreadsParsed: (threads: Thread[]) => void;
  customCss?: string;
  tailConfig?: { show: boolean; mode: 'random' | 'order'; list: string[] };
  getTailForPost?: (postId: string, floorIndex: number) => string | undefined;
  postTimeMap?: Record<string, string>;
}

export const Preview: React.FC<PreviewProps> = ({ 
  content, 
  theme, 
  activeThreadId,
  onThreadChange,
  onThreadsParsed,
  customCss,
  tailConfig,
  getTailForPost,
  postTimeMap
}) => {
  // Memoize parsing
  const threads = useMemo(() => {
     const parsed = parseMarkdownToThreads(content);
     return parsed;
  }, [content]);

  // Notify parent about threads when they change
  React.useEffect(() => {
    onThreadsParsed(threads);
  }, [threads, onThreadsParsed]);

  // Handle Link Navigation
  const handleLinkClick = (href: string) => {
      // ... (Link handling logic remains same as before) ...
      console.log('[Preview] handleLinkClick:', href);
      if (!href.startsWith('#')) return;
      let id = href.substring(1);

      // Support special user syntax: #post2 -> Thread 2 (index 1)
      const postMatch = id.match(/^post(\d+)$/i);
      if (postMatch) {
          const threadNum = parseInt(postMatch[1], 10);
          const targetThread = threads[threadNum - 1]; 
          if (targetThread) {
             onThreadChange(targetThread.id);
             return;
          }
      }

      // Check if it's cross-thread (thread-X-floor-Y)
      if (id.startsWith('thread-')) {
          const partMap = id.split('-'); 
          if (partMap.length === 2) {
              onThreadChange(id);
              return;
          }

          const targetThreadId = `thread-${partMap[1]}`;
          
          if (targetThreadId !== activeThreadId) {
              onThreadChange(targetThreadId);
              setTimeout(() => {
                  const el = document.getElementById(id);
                  if(el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('bg-yellow-100', 'transition-colors', 'duration-500');
                    setTimeout(() => el.classList.remove('bg-yellow-100'), 1000);
                  }
              }, 150);
          } else {
              const el = document.getElementById(id);
              if(el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('bg-yellow-100', 'transition-colors', 'duration-500');
                setTimeout(() => el.classList.remove('bg-yellow-100'), 1000);
              }
          }
      } else {
          const el = document.getElementById(id);
          if(el) el.scrollIntoView({ behavior: 'smooth' });
      }
  };

  // Global Interaction Handler
  React.useEffect(() => {
    const handleInteraction = (e: MouseEvent) => {
       const target = e.target as HTMLElement;
       if (target.classList.contains('spoiler')) {
          target.classList.toggle('is-revealed');
          return;
       }
    };

    const container = document.getElementById('preview-capture');
    if (container) {
        container.addEventListener('click', handleInteraction);
    }
    return () => {
        if (container) container.removeEventListener('click', handleInteraction);
    };
  }, []);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  return (
    <div 
      className={clsx("h-full overflow-auto custom-scrollbar scroll-smooth", theme.className)}
      id="preview-scroll-container"
    >
      <div className={clsx(
        "min-h-full transition-colors duration-300 p-4 md:p-8",
        "forum-container" // Key class for theme variables
      )}>
        {customCss && <style>{customCss}</style>}
        <div id="preview-capture" className="max-w-2xl mx-auto">
          {activeThread ? (
             <>
               <div className="mb-6 text-center opacity-80 animate-fade-in">
                  <h1 className="text-xl font-bold mb-2">{activeThread.title}</h1>
                  <div className="text-xs">共 {activeThread.posts.length} 条回复</div>
               </div>
               <div className="space-y-4">
                  {activeThread.posts.map((post, index) => {
                     // Determine tail
                     let tail = post.clientTail;
                     if (!tail && tailConfig?.show && getTailForPost) {
                         tail = getTailForPost(post.id, index);
                     }
                     
                     const displayTime = postTimeMap ? postTimeMap[post.id] : undefined;
                     
                     return (
                        <PostItem 
                            key={post.id} 
                            post={post} 
                            clientTail={tail}
                            onLinkClick={handleLinkClick}
                            displayTimestamp={displayTime} 
                        />
                     );
                  })}
               </div>
               <div className="mt-8 text-center text-xs opacity-50 py-4">- End of Thread -</div>
             </>
          ) : (
            <div className="text-center text-gray-400 mt-20">
               没有任何内容...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
