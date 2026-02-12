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
   该模板展示了 Forum Generator 中所有可自定义的核心类名。
   你可以取消注释并修改数值来定制界面。
   提示：为了确保覆盖默认主题，请尽量在属性后添加 !important。
   ========================================================================== */

/* --- 1. 全局容器 (Container) --- */
/* 整个论坛页面的背景和字体设置 */
/*
.forum-container {
  background-color: #f0f9ff !important;
  font-family: "Microsoft YaHei", sans-serif !important;
  
  /* 如需背景图片: */
  /* background-image: url('https://example.com/bg.jpg') !important; */
  /* background-size: cover !important; */
}
*/

/* --- 2. 帖子卡片 (Post Card) --- */
/* 每一层楼（包括主楼）的卡片样式 */
/*
.forum-post {
  /* 卡片背景色 */
  background-color: #ffffff !important;
  
  /* 边框样式 */
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  
  /* 阴影效果 */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  
  /* 卡片间距 */
  margin-bottom: 20px !important;
}
*/

/* --- 3. 帖子头部 (Post Header) --- */
/* 包含头像、作者名、楼层号的顶部区域 */
/*
.post-header {
  background-color: #f8fafc !important;
  border-bottom: 1px dashed #cbd5e1 !important;
  padding: 10px 16px !important;
  
  /* 调整高度或对齐方式 */
  /* min-height: 50px !important; */
}

/* 作者名样式 */
.author-name {
  color: #334155 !important;
  font-weight: bold !important;
  font-size: 1.1em !important;
}

/* 楼层号样式 (#1L, #2L) */
.floor-id {
  color: #94a3b8 !important;
  font-family: monospace !important;
}
*/

/* --- 4. 楼主高亮 (LZ Highlight) --- */
/* 特定于楼主（LZ）的样式覆盖 */
/*
.forum-post.is-lz {
  border: 2px solid #60a5fa !important; /* 蓝色边框 */
  box-shadow: 0 0 15px rgba(96, 165, 250, 0.2) !important;
}

/* 楼主的“楼层号”特殊样式 */
.is-lz .floor-id {
  background-color: #3b82f6 !important;
  color: white !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
}
*/

/* --- 5. 正文区域 (Post Content) --- */
/*
.post-content {
  padding: 20px !important;
  color: #1e293b !important;
  font-size: 16px !important;
  line-height: 1.8 !important;
}

/* 引用块 (Blockquote) */
.post-content blockquote {
  border-left: 4px solid #cbd5e1 !important;
  background-color: #f1f5f9 !important;
  color: #64748b !important;
  padding: 8px 12px !important;
  font-style: italic !important;
}
*/

/* --- 6. 底部区域 (Post Footer) --- */
/* 包含回复按钮、小尾巴的部分 */
/*
.post-footer {
  border-top: 1px solid #f1f5f9 !important;
  background-color: #ffffff !important;
  padding: 8px 16px !important;
}
*/

/* --- 7. 其他组件 (Misc) --- */
/* 黑幕/剧透 (Spoiler) */
/*
.spoiler {
  background-color: #000 !important;
  color: #000 !important;
}
.spoiler:hover {
  color: #fff !important;
}
*/
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
                    if(window.confirm('确定要清空所有自定义 CSS 吗？这将恢复默认主题样式。')) {
                        setCss('');
                    }
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-500/80 hover:bg-red-600 text-white text-xs rounded backdrop-blur-sm transition-colors shadow-sm"
              >
                  <X size={12} />
                  <span>清空重置</span>
              </button>
              
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
