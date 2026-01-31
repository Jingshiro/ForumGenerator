import React from "react";
import { X, ExternalLink, AlertTriangle } from "lucide-react";

interface ImageHostTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageHostTipsModal: React.FC<ImageHostTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 animate-fade-in">
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-scale-in border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center bg-gray-50/80 backdrop-blur-sm">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            图床指南
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 text-sm text-gray-700 max-h-[70vh] overflow-y-auto">
          
          <section>
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
              可用图床
            </h4>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
               <div className="flex flex-wrap gap-3">
                   <a 
                     href="https://picui.cn/" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                   >
                     PicUI <ExternalLink size={14} />
                   </a>
                   <a 
                     href="https://sm.ms/" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                   >
                     SM.MS <ExternalLink size={14} />
                   </a>
                   <a 
                     href="https://imgbb.com/" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                   >
                     ImgBB <ExternalLink size={14} />
                   </a>
                   <a 
                     href="https://imgse.com/" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                   >
                     路过图床 <ExternalLink size={14} />
                   </a>
               </div>
               <div className="flex items-start gap-1.5 text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded border border-orange-100">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>注意：以上均为第三方服务，不保证安全性及使用效果。</span>
               </div>
            </div>
          </section>

          <section>
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
              自建图床教程
            </h4>
            <div className="grid grid-cols-1 gap-2">
               <a 
                 href="https://juejin.cn/post/6844903993529860109" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
               >
                 <div className="font-bold text-gray-700 group-hover:text-purple-700 flex items-center gap-1">
                    GitHub + PicGo
                    <ExternalLink size={14} />
                 </div>
                 <div className="text-xs text-gray-500 mt-1">
                    需要注册Github账号。
                 </div>
               </a>
               
               <a 
                 href="https://juejin.cn/post/7599868109085605930" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all group"
               >
                 <div className="font-bold text-gray-700 group-hover:text-purple-700 flex items-center gap-1">
                    Cloudflare R2 + PicGo
                    <ExternalLink size={14} />
                 </div>
                 <div className="text-xs text-gray-500 mt-1">
                    需要注册Cloudflare账号。
                 </div>
               </a>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
               自建图床数据完全掌握在自己手中，最安全可靠。
            </p>
          </section>

        </div>
        
        <div className="p-3 bg-gray-50 border-t flex justify-end">
           <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors text-sm"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
