import React from 'react';
import { X, Settings, Smartphone } from 'lucide-react';
import { ClientTailConfig } from '../hooks/useClientTails';
import { TimeConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ClientTailConfig;
  setConfig: (c: ClientTailConfig) => void;
  timeConfig: TimeConfig;
  setTimeConfig: (tc: TimeConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, onClose, 
    config, setConfig,
    timeConfig, setTimeConfig
}) => {
  if (!isOpen) return null;

  const handleListChange = (val: string) => {
      setConfig({ ...config, list: val.split('\n').filter(s => s.trim()) });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Settings size={18} />
            设置
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
            {/* Time Configuration */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                     <Smartphone size={18} className="text-blue-600"/>
                     <h4 className="font-bold text-gray-700">时间显示设置</h4>
                </div>
                
                <div className="space-y-4 pl-1">
                     <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                checked={timeConfig.mode === 'hidden'}
                                onChange={() => setTimeConfig({...timeConfig, mode: 'hidden'})}
                                className="text-blue-600"
                            />
                            <span className="text-sm">隐藏 (默认)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                checked={timeConfig.mode === 'random'}
                                onChange={() => setTimeConfig({...timeConfig, mode: 'random'})}
                                className="text-blue-600"
                            />
                            <span className="text-sm">随机生成</span>
                        </label>
                     </div>

                     {timeConfig.mode === 'random' && (
                         <div className="grid grid-cols-2 gap-4 animate-fade-in">
                             <div className="space-y-1">
                                 <label className="text-xs font-medium text-gray-500">起始时间</label>
                                 <input 
                                    type="text" 
                                    className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={timeConfig.startTime}
                                    onChange={(e) => setTimeConfig({...timeConfig, startTime: e.target.value})}
                                    placeholder="2025-01-01 09:00"
                                 />
                             </div>
                             <div className="space-y-1">
                                 <label className="text-xs font-medium text-gray-500">结束时间</label>
                                 <input 
                                    type="text" 
                                    className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={timeConfig.endTime}
                                    onChange={(e) => setTimeConfig({...timeConfig, endTime: e.target.value})}
                                    placeholder="2025-01-02 23:00"
                                 />
                             </div>
                         </div>
                     )}
                     
                     <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                        提示：在楼层标题中使用 <code className="bg-gray-200 px-1 rounded">[时间]</code> 可强制显示特定内容。
                        <br/>例如：<code className="bg-gray-200 px-1 rounded"># 1L 某人[2024-01-01]</code>
                     </div>
                </div>
            </section>

            {/* Client Tail Configuration */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                     <Smartphone size={18} className="text-blue-600"/>
                     <h4 className="font-bold text-gray-700">小尾巴设置 (客户端标识)</h4>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">启用随机/顺序小尾巴</span>
                    <button 
                         onClick={() => setConfig({ ...config, show: !config.show })}
                         className={`w-12 h-6 rounded-full p-1 transition-colors ${config.show ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                         <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${config.show ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                {config.show && (
                    <div className="space-y-4 animate-fade-in pl-1">
                         <div className="flex gap-4">
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    checked={config.mode === 'random'}
                                    onChange={() => setConfig({...config, mode: 'random'})}
                                    className="text-blue-600"
                                 />
                                 <span className="text-sm">随机出现</span>
                             </label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                 <input 
                                    type="radio" 
                                    checked={config.mode === 'order'}
                                    onChange={() => setConfig({...config, mode: 'order'})}
                                    className="text-blue-600"
                                 />
                                 <span className="text-sm">按顺序循环</span>
                             </label>
                         </div>
                         
                         <div className="space-y-2">
                             <label className="text-xs font-medium text-gray-500 block">
                                 尾巴列表 (一行一个)
                             </label>
                             <textarea 
                                className="w-full border rounded p-2 text-sm h-32 resize-none focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                value={config.list.join('\n')}
                                onChange={(e) => handleListChange(e.target.value)}
                                placeholder="iPhone Client..."
                             />
                         </div>
                         
                         <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                             提示：你可以为特定楼层手动指定尾巴，只需在回复内容的最后一行加上 <code className="bg-gray-200 px-1 rounded">--来自XXX</code>
                         </div>
                    </div>
                )}
            </section>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
             完成
           </button>
        </div>
      </div>
    </div>
  );
};
