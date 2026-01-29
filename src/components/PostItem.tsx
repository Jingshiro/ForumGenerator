import React from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Post } from '../types';
import clsx from 'clsx';
import { MessageSquare, User } from 'lucide-react';

interface PostItemProps {
  post: Post;
  theme?: any; // Add theme prop if needed for styling, optional
  clientTail?: string;
  onLinkClick?: (href: string) => void; // Make optional to adapt to Preview usage if needed, or keep required
  displayTimestamp?: string;
}

export const PostItem: React.FC<PostItemProps> = ({ post, clientTail, onLinkClick, displayTimestamp }) => {
  return (
    <div 
      id={post.id} 
      data-id={post.id}
      className={clsx(
        "forum-post rounded-lg mb-4 overflow-hidden transition-all",
        "p-0" 
      )}
    >
      {/* Header */}
      <div className="post-header p-3 flex items-center justify-between text-sm bg-opacity-50">
        <div className="flex items-center gap-2">
           <div className={clsx(
             "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs",
             post.isLZ ? "bg-blue-500" : "bg-gray-400"
           )}>
             {post.isLZ ? "LZ" : <User size={16} />}
           </div>
           
           <div className="flex flex-col">
             <span className="font-bold">{post.author}</span>
             <span className="text-xs opacity-60">{displayTimestamp}</span>
           </div>
        </div>

        <div className="flex items-center gap-2 opacity-60">
           <span className="font-mono font-bold text-lg">{post.floorId}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 markdown-body">
        <Markdown 
          rehypePlugins={[rehypeRaw]} 
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
             a: ({node, ...props}) => {
               const isInternal = props.href?.startsWith('#');
               return (
                 <a 
                   {...props} 
                   className="text-blue-600 hover:underline cursor-pointer transition-colors"
                   target={isInternal ? undefined : "_blank"}
                   rel={isInternal ? undefined : "noopener noreferrer"}
                   onClick={(e) => {
                     if (isInternal && onLinkClick && props.href) {
                       e.preventDefault();
                       onLinkClick(props.href);
                     }
                   }}
                 />
               );
             }
          }}
        >
          {post.content}
        </Markdown>
      </div>

      {/* Footer / Actions */}
      <div className="px-4 py-2 border-t border-gray-100 opacity-70 text-xs flex gap-4 items-center">
         <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <MessageSquare size={14} /> 回复
         </button>
         <span className="flex-1"></span>
         {clientTail && (
             <span className="text-gray-400">{clientTail}</span>
         )}
      </div>
    </div>
  );
};
