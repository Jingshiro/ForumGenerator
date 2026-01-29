import { useState, useCallback, useMemo } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { CssEditorModal } from './components/CssEditorModal';
import { ExportModal } from './components/ExportModal';
import { SettingsModal } from './components/SettingsModal';
import { PublishModal } from './components/PublishModal';
import { usePreferences, THEMES } from './hooks/usePreferences';
import { useClientTails } from './hooks/useClientTails';
import { exportToHtml, generateHtml, ExportOptions } from './utils/exporter';
import { PenLine, Smartphone, Download, Menu, Palette, Settings, Upload } from 'lucide-react';
import clsx from 'clsx';
import { Thread } from './types';
import { calculatePostTimes } from './utils/timeUtils';
// Import main CSS (Tailwind) for export
import mainCss from './index.css?inline';

function App() {
  const { 
    content, setContent, 
    themeId, setThemeId,
    customCss, setCustomCss,
    timeConfig, setTimeConfig
  } = usePreferences();
  
  const { config: tailConfig, setConfig: setTailConfig, getTailForPost } = useClientTails();
  
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCssModal, setShowCssModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  // Removed local customCss state, used from hook
  
  const [exportAction, setExportAction] = useState<'download' | 'publish'>('download');
  const [publishContent, setPublishContent] = useState<string | null>(null);

  const currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];

  const handleThreadsParsed = useCallback((newThreads: Thread[]) => {
      setThreads(newThreads);
      if (!activeThreadId || !newThreads.find(t => t.id === activeThreadId)) {
          if (newThreads.length > 0) {
              setActiveThreadId(newThreads[0].id);
          }
      }
  }, [activeThreadId]);

  // Calculate timestamps for all threads
  // We flatten all posts from all threads to calculate sequentially?
  // Or calculate per thread?
  // Requirement: "strictly increasing" implies global or per thread?
  // Usually per thread. But if it's a forum, they might be interleaved.
  // For simplicity and "Forum Gen" context (usually one long story), let's calculate per thread 
  // OR treating the whole file as one sequence. 
  // Given the parser splits "!!! Post", let's assume they are separate contexts.
  // But wait, user might want time to flow across threads? 
  // Let's do per-thread calculation for now to keep them independent.
  
  const postTimeMap = useMemo(() => {
      const map: Record<string, string> = {};
      threads.forEach(t => {
          const threadTimes = calculatePostTimes(t.posts, timeConfig);
          Object.assign(map, threadTimes);
      });
      return map;
  }, [threads, timeConfig]);

  const handleExportConfirm = (options: { 
      watermark: { mode: 'default' | 'custom' | 'none', text: string, link: string }, 
      pageTitle: string, 
      favicon: string 
  }) => {
     const fullOptions: ExportOptions = {
         ...options,
         customCss,
         tailConfig: { ...tailConfig },
         timeConfig: { ...timeConfig },
         mainCss
     };

     if (exportAction === 'download') {
         exportToHtml(currentTheme, threads, fullOptions);
     } else {
         const html = generateHtml(currentTheme, threads, fullOptions);
         setPublishContent(html);
         setShowPublishModal(true);
     }
     setShowExportModal(false);
  };

  const openExportForDownload = () => {
      setExportAction('download');
      setShowExportModal(true);
  };

  const openExportForPublish = () => {
      setExportAction('publish');
      setShowExportModal(true);
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden bg-gray-100">
      
      <CssEditorModal 
         isOpen={showCssModal} 
         onClose={() => setShowCssModal(false)}
         css={customCss}
         setCss={setCustomCss}
      />
      
      <ExportModal 
         isOpen={showExportModal}
         onClose={() => setShowExportModal(false)}
         onConfirm={handleExportConfirm}
      />

      <SettingsModal 
         isOpen={showSettingsModal}
         onClose={() => setShowSettingsModal(false)}
         config={tailConfig}
         setConfig={setTailConfig}
         timeConfig={timeConfig}
         setTimeConfig={setTimeConfig}
      />

      <PublishModal 
         isOpen={showPublishModal}
         onClose={() => setShowPublishModal(false)}
         htmlContent={publishContent}
      />

      {/* Sidebar */}
      <Sidebar 
         threads={threads}
         activeThreadId={activeThreadId}
         onSelectThread={setActiveThreadId}
         isOpen={isSidebarOpen}
         onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative transition-all">
          
          {/* Header */}
          <div className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 z-10 w-full">
            <div className="flex items-center gap-3">
                <button onClick={() => setIsSidebarOpen(true)} className="p-1 hover:bg-gray-100 rounded">
                    <Menu size={20} />
                </button>
                <span className="font-bold hidden md:inline">论坛生成器</span>
            </div>
            
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button 
                className={clsx("p-1.5 rounded", activeTab === 'editor' ? 'bg-white shadow text-blue-600' : 'text-gray-500')}
                onClick={() => setActiveTab('editor')}
              >
                <PenLine size={18} />
              </button>
              <button 
                className={clsx("p-1.5 rounded", activeTab === 'preview' ? 'bg-white shadow text-blue-600' : 'text-gray-500')}
                onClick={() => setActiveTab('preview')}
              >
                <Smartphone size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="relative group">
                    <button className="p-2 text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1">
                    {currentTheme.name}
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block z-50">
                        <div className="py-1">
                        {THEMES.map(t => (
                            <button
                            key={t.id}
                            onClick={() => setThemeId(t.id)}
                            className={clsx(
                                "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                                themeId === t.id ? "text-blue-600 font-medium" : "text-gray-700"
                            )}
                            >
                            {t.name}
                            </button>
                        ))}
                        </div>
                    </div>
                </div>

                 <button 
                    onClick={() => setShowSettingsModal(true)}
                    title="设置"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                    <Settings size={20} />
                </button>

                 <button 
                    onClick={() => setShowCssModal(true)}
                    title="自定义 CSS"
                    className={clsx("p-2 hover:bg-gray-100 rounded transition-colors", customCss ? "text-blue-600" : "text-gray-600")}
                >
                    <Palette size={20} />
                </button>

                <button 
                    onClick={openExportForPublish}
                    title="发布到 GitHub"
                    className="text-gray-600 hover:text-blue-600"
                >
                    <Upload size={20} />
                </button>

                <button 
                    onClick={openExportForDownload}
                    title="导出 HTML"
                    className="text-gray-600 hover:text-blue-600"
                >
                <Download size={20} />
                </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden relative">
              <div className={clsx(
                "flex-1 h-full md:w-1/2 transition-all duration-300",
                activeTab === 'editor' ? 'block' : 'hidden md:block'
              )}>
                <Editor value={content} onChange={setContent} />
              </div>

              <div className={clsx(
                "flex-1 h-full md:w-1/2 relative bg-gray-50 border-l",
                activeTab === 'preview' ? 'block' : 'hidden md:block'
              )}>
                <Preview 
                   content={content} 
                   theme={currentTheme}
                   activeThreadId={activeThreadId}
                   onThreadChange={setActiveThreadId}
                   onThreadsParsed={handleThreadsParsed}
                   customCss={customCss}
                   tailConfig={tailConfig}
                   getTailForPost={getTailForPost}
                   
                   postTimeMap={postTimeMap} // Pass calculated times
                />
              </div>
          </div>
      </div>
    </div>
  );
}

export default App;
