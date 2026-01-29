import React, { useRef, useState } from 'react';
import { HelpCircle, Upload, Plus } from 'lucide-react';
import { TipsModal } from './TipsModal';

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [showTips, setShowTips] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleQuickAdd = () => {
    // 1. Determine the context (New Post vs Continue Thread)
    // Find the last occurrence of "!!! Post" and "# <N>L"
    const lastPostIndex = value.lastIndexOf('!!! Post');
    // Regex for finding floors: matches # 123L at start of line
    // We need to find the *last* one.
    const floorRegex = /^#\s+(\d+)L/gm;
    let match;
    let lastFloorNum = 0;
    let lastFloorIndex = -1;

    while ((match = floorRegex.exec(value)) !== null) {
      if (match.index > lastFloorIndex) {
        lastFloorIndex = match.index;
        lastFloorNum = parseInt(match[1], 10);
      }
    }

    let startNum = lastFloorNum + 1;
    let isNewThread = false;

    // Check if we are starting a fresh thread (Post declaration is after the last floor)
    if (lastPostIndex > lastFloorIndex) {
      isNewThread = true;
      startNum = 1;
    } 
    // If no floors at all and no post (empty doc), also start at 1
    else if (lastFloorNum === 0) {
      isNewThread = true; // effectively treat as new
      startNum = 1;
    }

    // 2. Generate content
    let newContent = value;
    // ensure newline separation if not empty
    if (newContent && !newContent.endsWith('\n\n')) {
      newContent += newContent.endsWith('\n') ? '\n' : '\n\n';
    }

    const floorsToAdd = [];
    for (let i = 0; i < 10; i++) {
        const floorNum = startNum + i;
        // Refined: Only mark LZ if explicitly needed for new thread start-up. 
        // Otherwise just # NL with no author (will default to anonymous if parsed) or explicit empty.
        // User asked to remove "匿名".
        // Parser defaults empty author to "匿名用户", so standard usage `# 5L` works fine.
        
        let line = `# ${floorNum}L`;
        if (isNewThread && i === 0) {
            line += ` LZ`;
        }
        
        floorsToAdd.push(`${line}\n回复内容...\n\n`);
    }

    const appendText = floorsToAdd.join('\n');
    onChange(newContent + appendText);
    
    // Focus and scroll to bottom
    setTimeout(() => {
        if(textareaRef.current) {
            textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
            textareaRef.current.focus();
        }
    }, 100);
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
          
          {/* Quick Add FAB */}
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-6 right-6 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-10"
            title="自动追加10楼"
          >
             <Plus size={24} />
          </button>
      </div>
    </div>
  );
};
