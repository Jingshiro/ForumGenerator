import React from 'react';
import { X, Code, RotateCcw } from 'lucide-react';

interface CssEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  css: string;
  setCss: (css: string) => void;
}

const CSS_TEMPLATE = `/* ==========================================================================
   自定义 CSS 模板 / Custom CSS Template
   --------------------------------------------------------------------------
   你可以直接修改下面的代码来覆盖默认的主题样式。
   提示：为了确保你的样式生效，建议在属性后加上 !important。
   ========================================================================== */

/* --- 1. 全局配置 (Global Settings) --- */
:root {
  /* 调整页面背景色 */
  --bg-color-override: #f0f9ff;
  
  /* 调整字体 (建议使用系统默认或网络字体) */
  --font-family-override: "Microsoft YaHei", "Segoe UI", sans-serif;
}

/* 应用全局背景和字体 */
.forum-container {
  background-color: var(--bg-color-override) !important;
  font-family: var(--font-family-override) !important;
}

/* --- 2. 帖子外观 (Post Appearance) --- */
.forum-post {
  /* 背景色: 白色带一点蓝 */
  background-color: #ffffff !important;
  
  /* 边框: 2像素实线，浅蓝色 */
  border: 2px solid #bae6fd !important;
  
  /* 圆角: 设置得大一些看起来更可爱 */
  border-radius: 16px !important;
  
  /* 阴影: 增加一点立体感 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  
  /* 帖子之间的间距 */
  margin-bottom: 24px !important;
}

/* --- 3. 楼层头部 (Header) --- */
.post-header {
  /* 头部背景色: 极浅的灰色 */
  background-color: #f8fafc !important;
  
  /* 底部虚线分隔 */
  border-bottom: 2px dashed #e2e8f0 !important;
  
  /* 增加内边距 */
  padding: 12px 20px !important;
}

/* 楼层号 (#1L, #2L) */
.floor-id {
  color: #64748b !important;
  font-weight: bold !important;
  font-size: 1.1em !important;
}

/* 作者名 */
.author-name {
  color: #0f172a !important;
  font-size: 1.1em !important;
}

/* 楼主标识 (LZ) */
.is-lz {
  background-color: #ff6b6b !important; /* 红色背景 */
  color: white !important;
  border-radius: 4px !important;
  padding: 2px 6px !important;
}

/* --- 4. 正文内容 (Content) --- */
.markdown-body {
  font-size: 16px !important;
  line-height: 1.8 !important;
  color: #334155 !important;
  padding: 20px !important;
}

/* 引用块 (Blockquote) */
/* 通常用于显示回复或者特殊的灰字内容 */
.markdown-body blockquote {
  border-left: 4px solid #3b82f6 !important; /* 左侧蓝条 */
  background-color: #eff6ff !important;    /* 浅蓝背景 */
  color: #1e40af !important;
  padding: 10px 16px !important;
}

/* --- 5. 图片样式 (Images) --- */
.markdown-body img {
  border-radius: 8px !important;
  max-height: 400px !important; /* 限制图片最大高度 */
  object-fit: contain !important; /* 保持比例 */
  border: 1px solid #e2e8f0 !important;
}
`;

export const CssEditorModal: React.FC<CssEditorModalProps> = ({ isOpen, onClose, css, setCss }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden animate-scale-in">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
             <Code size={20} className="text-blue-600"/>
             <h3 className="font-bold text-lg text-gray-800">自定义 CSS</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col relative p-0">
           <textarea
              className="flex-1 w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-gray-900 text-gray-100"
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder="/* 在这里输入 CSS 代码。提示：使用 !important 以确保覆盖默认主题样式 */"
              spellCheck={false}
           />
           
           {/* Controls overlay */}
           <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={() => {
                    if(window.confirm('确定要覆盖当前 CSS 加载模板吗？')) {
                        setCss(CSS_TEMPLATE);
                    }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded border border-white/20 backdrop-blur-sm transition-colors"
              >
                  <RotateCcw size={12} />
                  <span>加载模板</span>
              </button>
           </div>
        </div>
        
        <div className="p-3 border-t bg-gray-50 text-right flex justify-between items-center text-xs text-gray-500">
           <span>修改后实时生效</span>
           <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
