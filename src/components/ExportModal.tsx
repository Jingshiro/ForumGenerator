import React, { useState, useRef } from 'react';
import { X, Download, Type, ImageIcon } from 'lucide-react';

interface ExportOptions {
  watermark: {
    mode: 'default' | 'custom' | 'none';
    text: string;
    link: string;
  };
  pageTitle: string;
  favicon: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: ExportOptions) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [watermarkMode, setWatermarkMode] = useState<'default' | 'custom' | 'none'>('default');
  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  
  const [pageTitle, setPageTitle] = useState('论坛体导出');
  const [favicon, setFavicon] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
              if (typeof evt.target?.result === 'string') {
                  setFavicon(evt.target.result);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Download size={18} />
            导出设置
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6 flex-1">
           
           {/* Section 1: Page Metadata */}
           <section>
              <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">页面设置</h4>
              <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        <Type size={12} />
                        网页标题
                     </label>
                     <input 
                       type="text" 
                       className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                       value={pageTitle}
                       onChange={(e) => setPageTitle(e.target.value)}
                       placeholder="例如：我的论坛体小说"
                     />
                  </div>
                  
                  <div className="space-y-1">
                     <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        <ImageIcon size={12} />
                        网页图标 (Favicon)
                     </label>
                     <div className="flex gap-2">
                         <input 
                           type="text" 
                           className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                           value={favicon}
                           onChange={(e) => setFavicon(e.target.value)}
                           placeholder="输入图片 URL 或上传..."
                         />
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFaviconUpload}
                            accept="image/*"
                            className="hidden" 
                         />
                         <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded text-sm transition-colors border"
                         >
                            选择文件
                         </button>
                     </div>
                     {favicon && (
                         <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
                             <img src={favicon} alt="Preview" className="w-4 h-4 object-contain" />
                             <span>已就绪</span>
                         </div>
                     )}
                  </div>
              </div>
           </section>

           <hr />

           {/* Section 2: Watermark */}
           <section>
              <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">水印设置</h4>
              
              <div className="flex flex-col gap-2 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="wm_mode" 
                        checked={watermarkMode === 'default'} 
                        onChange={() => setWatermarkMode('default')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">默认 Github 水印</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="wm_mode" 
                        checked={watermarkMode === 'custom'} 
                        onChange={() => setWatermarkMode('custom')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">自定义文字水印</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                      <input 
                        type="radio" 
                        name="wm_mode" 
                        checked={watermarkMode === 'none'} 
                        onChange={() => setWatermarkMode('none')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">无水印</span>
                  </label>
              </div>

              {watermarkMode === 'custom' && (
                 <div className="space-y-3 pl-2 border-l-2 border-blue-100 animate-fade-in">
                    <div className="space-y-1">
                       <label className="text-xs font-medium text-gray-500">自定义文字</label>
                       <input 
                         type="text" 
                         className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                         value={text}
                         onChange={(e) => setText(e.target.value)}
                         placeholder="例如：By 某某某"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-xs font-medium text-gray-500">超链接 (可选)</label>
                       <input 
                         type="text" 
                         className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-blue-600"
                         value={link}
                         onChange={(e) => setLink(e.target.value)}
                         placeholder="https://..."
                       />
                    </div>
                 </div>
              )}
           </section>

        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 flex-shrink-0">
           <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded transition-colors text-sm"
          >
            取消
          </button>
           <button 
            onClick={() => onConfirm({ 
                watermark: { mode: watermarkMode, text, link },
                pageTitle,
                favicon
            })}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
          >
            确认导出
          </button>
        </div>
      </div>
    </div>
  );
};
