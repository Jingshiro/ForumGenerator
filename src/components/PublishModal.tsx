import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Link as LinkIcon, Loader } from 'lucide-react';
import { publishToGithub, PublishResult } from '../utils/github';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string | null; // Content to upload
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, htmlContent }) => {
  const [token, setToken] = useState('');
  const [repoStr, setRepoStr] = useState(''); // owner/repo
  const [path, setPath] = useState('index.html');
  
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<PublishResult | null>(null);

  if (!isOpen) return null;

  const handlePublish = async () => {
     if (!htmlContent) return;
     if (!token || !repoStr || !path) {
         setStatus('error');
         setResult({ success: false, message: '请填写所有必填项' });
         return;
     }
     
     const parts = repoStr.split('/');
     if(parts.length !== 2) {
         setStatus('error');
         setResult({ success: false, message: '仓库格式错误，应为 username/repo' });
         return;
     }

     setStatus('uploading');
     const [owner, repo] = parts;
     
     const res = await publishToGithub(token, owner, repo, path, htmlContent);
     
     if (res.success) {
         setStatus('success');
         setResult(res);
     } else {
         setStatus('error');
         setResult(res);
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Upload size={18} />
            发布到 GitHub Pages
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
            {status === 'success' ? (
                <div className="text-center py-4 space-y-4 animate-fade-in">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800">发布成功!</h4>
                    <p className="text-gray-500 text-sm">你的页面已上传。GitHub Pages 可能需要几分钟刷新。</p>
                    
                    <div className="bg-gray-50 p-3 rounded border flex items-center gap-2 text-sm text-blue-600 break-all select-all">
                        <LinkIcon size={14} className="shrink-0" />
                        <a href={result?.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {result?.url}
                        </a>
                    </div>
                </div>
            ) : (
                <>
                   <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-100">
                       此功能将生成的 HTML 直接上传到你的 GitHub 仓库。请确保你已在该仓库开启 GitHub Pages。
                   </p>
                   
                   <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-700">Personal Access Token (PAT)</label>
                       <input 
                         type="password" 
                         className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                         placeholder="ghp_xxxxxxxxxxxx"
                         value={token}
                         onChange={(e) => setToken(e.target.value)}
                       />
                       <p className="text-[10px] text-gray-400">需要勾选 'repo' 权限</p>
                   </div>
                   
                   <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-700">仓库 (Owner/Repo)</label>
                       <input 
                         type="text" 
                         className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                         placeholder="username/my-blog"
                         value={repoStr}
                         onChange={(e) => setRepoStr(e.target.value)}
                       />
                   </div>
                   
                   <div className="space-y-1">
                       <label className="text-xs font-bold text-gray-700">文件路径</label>
                       <input 
                         type="text" 
                         className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                         placeholder="index.html"
                         value={path}
                         onChange={(e) => setPath(e.target.value)}
                       />
                   </div>

                   {status === 'error' && (
                       <div className="text-xs text-red-600 flex items-center gap-1">
                           <AlertCircle size={12} />
                           {result?.message}
                       </div>
                   )}
                </>
            )}
        </div>
        
        {status !== 'success' && (
             <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
               <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded text-sm">取消</button>
               <button 
                 onClick={handlePublish} 
                 disabled={status === 'uploading'}
                 className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors shadow-sm text-sm font-medium flex items-center gap-2 disabled:opacity-50"
               >
                 {status === 'uploading' && <Loader size={14} className="animate-spin" />}
                 {status === 'uploading' ? '上传中...' : '发布'}
               </button>
             </div>
        )}
      </div>
    </div>
  );
};
