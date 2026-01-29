import React from 'react';
import { Thread } from '../types';
import { Hash, Menu, X } from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  threads, 
  activeThreadId, 
  onSelectThread, 
  isOpen, 
  onClose 
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={clsx(
        "fixed md:relative top-0 bottom-0 left-0 z-50 w-64 bg-white border-r shadow-lg md:shadow-none transform transition-transform duration-300 ease-in-out flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        // Helper class for export script to find sidebar
        "forum-sidebar" 
      )}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Menu size={18} />
            帖子列表
          </h2>
          <button onClick={onClose} className="md:hidden text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => {
                onSelectThread(thread.id);
                onClose();
              }}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-start gap-2",
                activeThreadId === thread.id 
                  ? "bg-blue-50 text-blue-600 font-medium" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Hash size={16} className="mt-0.5 shrink-0 opacity-50" />
              <span className="line-clamp-2">{thread.title}</span>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t text-xs text-gray-400 text-center">
           共 {threads.length} 个帖子
        </div>
      </div>
    </>
  );
};
