import React from 'react';
import { X, Code, RotateCcw } from 'lucide-react';

interface CssEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  css: string;
  setCss: (css: string) => void;
}

const CSS_TEMPLATE = `/* 自定义 CSS 模板 */
/* 提示：由于主题样式优先级较高，建议使用 !important 或更具体的选择器 */

/* 修改帖子背景色 */
.forum-post {
  background-color: #f0f9ff !important;
  border-radius: 12px !important;
  border: 2px solid #bae6fd !important;
}

/* 修改楼层头部 (用户信息栏) */
.post-header {
  background-color: rgba(0,0,0, 0.02) !important;
  border-bottom: 1px dashed #ccc !important;
}

/* 修改楼主标识 */
.is-lz {
  background-color: #ff6b6b !important;
}

/* 修改正文字体 */
.markdown-body {
  font-family: 'Segoe UI', sans-serif !important;
  font-size: 15px !important;
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
