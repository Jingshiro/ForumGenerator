import React, { useRef, useState } from 'react';
import { HelpCircle, Upload, Plus, Image, FilePlus, Link, User, Layers } from 'lucide-react';
import { TipsModal } from './TipsModal';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
}

const CleanupIcon = () => (
    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor">
        <path d="M860.525714 622.884571l-188.708571 326.729143a34.304 34.304 0 0 1-46.811429 12.580572l-89.161143-51.492572 120.100572-207.945143a34.377143 34.377143 0 0 0-7.533714-43.300571l-5.046858-3.510857a34.377143 34.377143 0 0 0-43.300571 7.460571l-3.510857 5.12-120.100572 207.872-118.784-68.608L477.622857 599.917714a34.377143 34.377143 0 0 0-7.460571-43.300571l-5.12-3.657143a34.377143 34.377143 0 0 0-43.300572 7.533714l-3.510857 5.12-120.100571 207.872-207.872-119.954285a34.304 34.304 0 0 1-12.580572-46.884572l188.708572-326.802286 594.066285 343.04z m-61.586285-510.829714c16.457143 9.508571 22.016 30.427429 12.580571 46.811429L725.796571 307.419429l207.872 120.027428c16.457143 9.508571 22.089143 30.500571 12.580572 46.884572l-34.304 59.392a34.304 34.304 0 0 1-46.811429 12.580571l-534.674285-308.662857a34.304 34.304 0 0 1-12.580572-46.884572l34.304-59.465142a34.304 34.304 0 0 1 46.811429-12.507429l207.945143 120.027429 85.723428-148.48a34.304 34.304 0 0 1 46.884572-12.580572l59.392 34.304z"></path>
    </svg>
);

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [showTips, setShowTips] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    if (textareaRef.current) {
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const scrollTop = textarea.scrollTop; // Record scroll position
        
        const newValue = value.substring(0, start) + text + value.substring(end);
        onChange(newValue);
        
        // Use requestAnimationFrame or double timeout to ensure DOM update before restoring state
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(start + text.length, start + text.length);
                textareaRef.current.scrollTop = scrollTop; // Restore scroll position
            }
        }, 0);
    } else {
        onChange(value + text);
    }
    setIsActionMenuOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        onChange(text);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleClear = () => {
    if (value.trim() === '') return;
    
    if (window.confirm('确定要清空所有内容吗？此操作无法撤销。')) {
      onChange('');
    }
  };

  const handleAddFloors = () => {
    if (!textareaRef.current) return;
    
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    
    // Analyze context BEFORE cursor
    const lastPostIndex = textBeforeCursor.lastIndexOf('!!! Post');
    const floorRegex = /^#\s+(\d+)L/gm;
    let match;
    let lastFloorNum = 0;
    let lastFloorIndex = -1;

    while ((match = floorRegex.exec(textBeforeCursor)) !== null) {
      if (match.index > lastFloorIndex) {
        lastFloorIndex = match.index;
        lastFloorNum = parseInt(match[1], 10);
      }
    }

    let startNum = lastFloorNum + 1;
    let isNewThread = false;

    if (lastPostIndex > lastFloorIndex) {
      isNewThread = true;
      startNum = 1;
    } else if (lastFloorNum === 0) {
      isNewThread = true;
      startNum = 1;
    }

    const floorsToAdd = [];
    for (let i = 0; i < 10; i++) {
        const floorNum = startNum + i;
        let line = `# ${floorNum}L`;
        if (isNewThread && i === 0) {
            line += ` LZ`;
        }
        floorsToAdd.push(`${line}\n\n`);
    }

    // Ensure content starts with newline if not at start of line (optional, but good for formatting)
    // Actually insertAtCursor just inserts. 
    // Let's add a leading newline if the char before cursor isn't a newline.
    let appendText = floorsToAdd.join('\n');
    if (cursorPosition > 0 && value[cursorPosition - 1] !== '\n') {
        appendText = '\n' + appendText;
    }
    
    insertAtCursor(appendText);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r shadow-sm relative">
      <TipsModal isOpen={showTips} onClose={() => setShowTips(false)} />
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".txt,.md" 
        className="hidden" 
      />

      <div className="p-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
           <h2 className="font-bold text-gray-700">编辑器</h2>
           <button 
             onClick={() => setShowTips(true)}
             className="text-gray-400 hover:text-blue-600 transition-colors"
             title="语法帮助"
           >
             <HelpCircle size={18} />
           </button>
        </div>
        <div className="flex items-center gap-2">
            <button 
               onClick={handleClear}
               className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
               title="清空内容"
            >
               <CleanupIcon />
               <span>清空</span>
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button 
               onClick={handleImportClick}
               className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
               title="导入 .txt 或 .md"
            >
               <Upload size={14} />
               <span>导入</span>
            </button>
        </div>
      </div>
      
      <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            className="w-full h-full p-4 resize-none focus:outline-none font-mono text-sm leading-relaxed"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="# LZ 楼主\n输入内容..."
            spellCheck={false}
          />
          
          {/* Quick Add Menu */}
          <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-20">
              {isActionMenuOpen && (
                  <div className="flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-4 fade-in duration-200">
                      <button
                        onClick={() => insertAtCursor('<"图片url">')}
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md border hover:bg-gray-50 text-sm text-gray-700 transition-all whitespace-nowrap"
                      >
                         <User size={16} className="text-purple-600" />
                         <span>指定头像</span>
                      </button>
                      <button
                        onClick={() => insertAtCursor('[显示内容](跳转目标)')}
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md border hover:bg-gray-50 text-sm text-gray-700 transition-all whitespace-nowrap"
                      >
                         <Link size={16} className="text-green-600" />
                         <span>插入跳转</span>
                      </button>
                      <button
                        onClick={() => {
                            const prefix = (!value || value.endsWith('\n')) ? '' : '\n';
                            insertAtCursor(`${prefix}!!! Post: `);
                        }}
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md border hover:bg-gray-50 text-sm text-gray-700 transition-all whitespace-nowrap"
                      >
                         <FilePlus size={16} className="text-orange-600" />
                         <span>新建帖子</span>
                      </button>
                      <button
                        onClick={() => insertAtCursor('![图片描述](图片链接)')}
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md border hover:bg-gray-50 text-sm text-gray-700 transition-all whitespace-nowrap"
                      >
                         <Image size={16} className="text-blue-600" />
                         <span>插入贴图</span>
                      </button>
                      <button
                        onClick={handleAddFloors}
                        className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md border hover:bg-gray-50 text-sm text-gray-700 transition-all whitespace-nowrap"
                      >
                         <Layers size={16} className="text-blue-600" />
                         <span>追加10楼</span>
                      </button>
                  </div>
              )}
              
              <button
                onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${isActionMenuOpen ? 'bg-gray-200 text-gray-600 rotate-45' : 'bg-blue-600 text-white'}`}
                title="快速插入"
              >
                 <Plus size={24} />
              </button>
          </div>
      </div>
    </div>
  );
};
