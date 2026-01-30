import { Theme, Thread } from '../types';
import { marked } from 'marked';
import { calculatePostTimes } from './timeUtils';

import baseCss from '../theme/base.css?inline';

export interface ExportOptions {
    watermark: {
        mode: 'default' | 'custom' | 'none';
        text: string;
        link: string;
    };
    customCss?: string;
    pageTitle: string;
    favicon?: string;
    tailConfig: {
        show: boolean;
        mode: 'random' | 'order';
        list: string[];
    };
    avatarConfig: {
        show: boolean;
        mode: 'random' | 'order';
        list: string[];
    };
    timeConfig: any; // Using any or explicit type if preferred
    mainCss?: string; // New field for full Tailwind CSS
}

// ... regex configurations ...
// Helper: Configured Marked Renderer
const renderer = new marked.Renderer();
// Fix for Marked v12+: link takes an object
renderer.link = function({ href, title, tokens }: any) {
    const text = this.parser.parseInline(tokens);
    if (!href) return text;
    if (href.startsWith('#')) {
        const titleAttr = title ? ` title="${title}"` : '';
        return `<a href="${href}"${titleAttr}>${text}</a>`;
    }
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline transition-colors">${text}</a>`;
};

marked.setOptions({
    breaks: true,
    gfm: true,
    renderer
});

export const generateHtml = (theme: Theme, threads: Thread[], options: ExportOptions): string => {
  // 1. Gather Styles
  let styles = '';
  
  if (options.mainCss) {
      styles += `/* Tailwind & Framework Styles */\n${options.mainCss}\n`;
  } else {
      styles += `html,body{margin:0} /* Minimal reset */`; 
  }

  styles += `/* Base Styles */\n${baseCss}\n`;
  styles += `/* Active Theme: ${theme.name} */\n${theme.css || ''}\n`;
  if (theme.id === 'weibo') {
      styles += `\nbody { background-color: #f6f6f6; }\n`;
  }
  
  if(options.customCss) {
      styles += `/* Custom CSS */\n${options.customCss}\n\n`;
  }

  styles += `
/* Tabs & Utils */
.tab-active { color: #2563eb; border-bottom: 2px solid #2563eb; font-weight: 500; }
.tab-inactive { color: #6b7280; }
.tab-inactive:hover { color: #374151; }
.spoiler { 
    background-color: #000; color: #000; padding: 0 4px; border-radius: 2px; cursor: pointer; transition: all 0.2s;
}
.spoiler:hover, .spoiler.revealed { color: #fff; }
.thread-container { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.hidden { display: none; }
  `;

  // 2. Helper Functions
  const getTailForPost = (postId: string, floorIndex: number) => {
      const { tailConfig } = options;
      if (!tailConfig.show || tailConfig.list.length === 0) return undefined;
      
      let index = 0;
      if (tailConfig.mode === 'order') {
          index = floorIndex % tailConfig.list.length;
      } else {
          const hash = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          index = hash % tailConfig.list.length;
      }
      return tailConfig.list[index];
  };

  const getAvatarForAuthor = (authorName: string, _floorIndex: number, specificAvatar?: string) => {
    const { avatarConfig } = options;
    if (specificAvatar) return specificAvatar;
    if (!avatarConfig.show || avatarConfig.list.length === 0) return undefined;

    let index = 0;
    if (avatarConfig.mode === 'order') {
        const hash = authorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        index = hash % avatarConfig.list.length;
    } else {
         const hash = authorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
         index = (hash * 13) % avatarConfig.list.length;
    }
    return avatarConfig.list[index];
  };

  const renderMarkdown = (content: string) => {
      // Handle custom spoiler syntax ||text||
      let processed = content.replace(/\|\|(.+?)\|\|/g, '<span class="spoiler" onclick="this.classList.toggle(\'revealed\')">$1</span>');
      return marked.parse(processed) as string;
  };
  
  // Pre-calculate timestamps for all threads
  // Note: App.tsx calculates per thread, we should do same here or flat?
  // exporter is a standalone function, so let's recalc.
  const postTimeMap: Record<string, string> = {};
  threads.forEach(t => {
      const threadTimes = calculatePostTimes(t.posts, options.timeConfig);
      Object.assign(postTimeMap, threadTimes);
  });

  // 3. Generate Sidebar HTML
  const sidebarItemsHtml = threads.map((t, index) => {
    const safeTitle = t.title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const isActive = index === 0;
    return `
      <button 
        onclick="switchThread('${t.id}')"
        class="thread-btn w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 mb-1 ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}"
        data-thread-id="${t.id}"
      >
        <div class="truncate text-sm">${safeTitle}</div>
      </button>
    `;
  }).join('\n');

  // 4. Generate Main Content HTML (ALL Threads rendered)
  const allThreadsHtml = threads.map((thread, threadIndex) => {
      const isVisible = threadIndex === 0;
      
      const postsHtml = thread.posts.map((post, index) => {
          const contentHtml = renderMarkdown(post.content);
          
          let tail = post.clientTail;
          if (!tail) {
              tail = getTailForPost(post.id, index);
          }
          const tailHtml = tail ? `<span class="text-gray-400">${tail}</span>` : '';

          // Resolve Avatar
          const avatarUrl = getAvatarForAuthor(post.author, index, post.avatar);

          const isLzClass = post.isLZ ? 'is-lz' : '';
          const avatarBg = post.isLZ ? "bg-blue-500" : "bg-gray-400";
          const avatarContent = avatarUrl 
            ? `<img src="${avatarUrl}" alt="${post.author}" class="w-full h-full object-cover rounded-full">`
            : (post.isLZ 
                ? "LZ" 
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
              );
          
          // Use calculated time
          const displayTimestamp = postTimeMap[post.id] || '';

          return `
             <div class="forum-post rounded-lg mb-4 overflow-hidden transition-all ${isLzClass}" id="${post.id}">
                 <div class="post-header p-3 flex items-center justify-between text-sm bg-opacity-50">
                      <div class="flex items-center gap-2">
                         <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${avatarBg}">
                             ${avatarContent}
                         </div>
                         <div class="flex flex-col">
                             <span class="author-name font-bold">${post.author}</span>
                             <span class="text-xs opacity-60">${displayTimestamp}</span>
                         </div>
                      </div>
                      <div class="flex items-center gap-2 opacity-60">
                          <span class="floor-id font-mono font-bold text-lg">${post.floorId}</span>
                      </div>
                 </div>

                 <div class="post-content p-4 markdown-body">
                     ${contentHtml}
                 </div>
                 
                 <div class="px-4 py-2 border-t border-gray-100 opacity-70 text-xs flex gap-4 items-center">
                      <button class="flex items-center gap-1 hover:text-blue-500 transition-colors">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2-2z"/></svg> 回复
                      </button>
                      <span class="flex-1"></span>
                      ${tailHtml}
                 </div>
             </div>
             <hr class="border-gray-100 my-4 opacity-50" />
          `;
      }).join('');

      return `
        <div id="${thread.id}" class="thread-container ${isVisible ? '' : 'hidden'}">
             <div class="mb-6 text-center opacity-80">
                 <h1 class="text-xl font-bold mb-2">${thread.title}</h1>
                 <div class="text-xs">共 ${thread.posts.length} 条回复</div>
             </div>
             ${postsHtml}
             <div class="mt-8 text-center text-xs opacity-50 py-4">- End of Thread -</div>
        </div>
      `;
  }).join('\n');

  // 5. Build Footer
  let footerHtml = '';
  if (options.watermark.mode === 'default') {
      footerHtml = `<div class="fixed bottom-0 right-0 p-2 text-xs text-gray-400 opacity-50 hover:opacity-100 transition-opacity z-50 flex items-center gap-1 pointer-events-auto">
        <span>Powered by 论坛体生成器</span>
        <a href="https://github.com/Antigravity" target="_blank" class="hover:text-black text-gray-600"><svg height="16" width="16" viewBox="0 0 16 16" style="fill:currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg></a>
      </div>`;
  } else if (options.watermark.mode === 'custom') {
      const linkHtml = options.watermark.link ? `<a href="${options.watermark.link}" target="_blank" class="hover:underline">${options.watermark.text}</a>` : `<span>${options.watermark.text}</span>`;
      footerHtml = `<div class="fixed bottom-0 right-0 p-2 text-xs text-gray-400 opacity-50 hover:opacity-100 transition-opacity z-50 pointer-events-auto">${linkHtml}</div>`;
  }

  // 6. Runtime Script
  const runtimeScript = `
    const mobileTitleEl = document.getElementById('mobile-header-title');
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    // Thread Metadata
    const THREAD_TITLES = ${JSON.stringify(threads.reduce((acc, t) => ({...acc, [t.id]: t.title}), {}))};
    let activeThreadId = "${threads.length > 0 ? threads[0].id : ''}";

    function switchThread(id) {
        if (!document.getElementById(id)) return;
        
        // Hide all
        document.querySelectorAll('.thread-container').forEach(el => el.classList.add('hidden'));
        // Show active
        document.getElementById(id).classList.remove('hidden');
        activeThreadId = id;
        
        // Update Sidebar
        document.querySelectorAll('.thread-btn').forEach(btn => {
            const isActive = btn.dataset.threadId === id;
            if (isActive) {
                btn.className = 'thread-btn w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 mb-1 bg-blue-50 text-blue-700 font-medium';
            } else {
                btn.className = 'thread-btn w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 mb-1 text-gray-700';
            }
        });

        // Mobile Title
        if (mobileTitleEl && THREAD_TITLES[id]) {
            mobileTitleEl.textContent = THREAD_TITLES[id];
        }

        // Scroll top
        const mainScroll = document.getElementById('main-scroll');
        if (mainScroll) mainScroll.scrollTop = 0;
        
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    }

    function openSidebar() {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        void overlay.offsetWidth; 
        overlay.classList.remove('opacity-0');
    }

    function closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }

    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Link Handling
    const THREAD_IDS = ${JSON.stringify(threads.map(t => t.id))};
    // Console log for debugging
    console.log('Forum Generator Runtime Loaded');
    console.log('Thread IDs:', THREAD_IDS);
    
    document.addEventListener('click', (e) => {
        try {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            console.log('Clicked link href:', href);
            
            if (href && href.startsWith('#')) {
                // Remove prevention temporarily to debug if logic runs? No, Keep it.
                e.preventDefault(); 
                
                let id = decodeURIComponent(href.substring(1)).trim(); 
                
                // Handle #postN syntax (Index-based thread jump)
                // Fix: Escape backslash in template string: \\d
                const postMatch = id.match(/^post(\\d+)$/i);
                
                if (postMatch) {
                    const threadNum = parseInt(postMatch[1], 10);
                    if (threadNum > 0 && threadNum <= THREAD_IDS.length) {
                        const targetThreadId = THREAD_IDS[threadNum - 1];
                        switchThread(targetThreadId);
                        return;
                    } else {
                        console.warn('Invalid thread number:', threadNum);
                    }
                }

                // Handle thread-X-floor-Y syntax cross-thread jump
                if (id.startsWith('thread-')) {
                    const parts = id.split('-');
                    if (parts.length > 1) {
                        const targetThreadId = \`thread-\${parts[1]}\`;
                        if (targetThreadId !== activeThreadId) {
                             switchThread(targetThreadId);
                             // Short delay to allow display change before scroll
                             setTimeout(() => {
                                const el = document.getElementById(id);
                                 if(el) {
                                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    el.classList.add('bg-yellow-100');
                                    setTimeout(() => el.classList.remove('bg-yellow-100'), 1000);
                                 }
                             }, 100);
                             return;
                        }
                    }
                }
                
                const targetEl = document.getElementById(id);
                if (targetEl) {
                    const threadContainer = targetEl.closest('.thread-container');
                    if (threadContainer && threadContainer.id !== activeThreadId) {
                        switchThread(threadContainer.id);
                    }
                    setTimeout(() => {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetEl.classList.add('bg-yellow-100');
                        setTimeout(() => targetEl.classList.remove('bg-yellow-100'), 1000);
                    }, 50);
                } else {
                    console.warn('Target element not found:', id);
                }
            }
        } catch (error) {
            console.error('Error handling link click:', error);
        }
    });

    // Initial Render
    if(activeThreadId && document.getElementById(activeThreadId)) {
        switchThread(activeThreadId);
    }
  `;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.pageTitle || '论坛体导出'}</title>
    ${options.favicon ? `<link rel="icon" href="${options.favicon}">` : ''}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;700&family=Inter:wght@400;500;600;700&family=Ma+Shan+Zheng&family=Noto+Sans+SC:wght@300;400;500;700&family=Noto+Serif+SC:wght@400;600;700&family=Quicksand:wght@400;500;600;700&family=ZCOOL+KuaiLe&display=swap" rel="stylesheet">
    <style>
        ${styles}
    </style>
</head>
<body class="${theme.className}">
    
    <!-- Mobile Header -->
    <div class="md:hidden h-14 bg-white border-b flex items-center justify-between px-4 fixed top-0 left-0 right-0 z-40">
        <span class="font-bold text-gray-700" id="mobile-header-title">论坛体</span>
        <button id="menu-btn" class="p-2 text-gray-600">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
    </div>

    <!-- Sidebar Overlay -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 hidden md:hidden transition-opacity opacity-0"></div>

    <div class="flex h-screen pt-14 md:pt-0 overflow-hidden">
        <!-- Sidebar -->
        <div id="sidebar" class="bg-white border-r w-64 flex flex-col fixed inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition-transform duration-300 z-50">
             <div class="p-4 border-b font-bold text-lg text-gray-800 hidden md:block">
                帖子列表
             </div>
             <div class="flex-1 overflow-y-auto p-2" id="thread-list">
                 ${sidebarItemsHtml}
             </div>
        </div>

        <!-- Main Content -->
        <div class="flex-1 overflow-auto custom-scrollbar scroll-smooth relative" id="main-scroll">
            <div class="min-h-full p-4 md:p-8 transition-colors duration-300 forum-container">
                <div class="max-w-2xl mx-auto" id="thread-content">
                    ${allThreadsHtml}
                </div>
            </div>
            ${footerHtml}
        </div>
    </div>

    <script>
        ${runtimeScript}
    </script>
</body>
</html>`;
};

export const exportToHtml = async (theme: Theme, threads: Thread[], options: ExportOptions) => {
  const html = generateHtml(theme, threads, options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${options.pageTitle || 'forum-export'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
