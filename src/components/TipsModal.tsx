import React from "react";
import { X } from "lucide-react";

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-scale-in">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">
            格式提示
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-gray-700">
          <section>
            <h4 className="font-bold text-blue-600 mb-2 border-b pb-1">
              1. 基础楼层
            </h4>
            <code className="block bg-gray-100 p-2 rounded mb-2 font-mono">
              # 1L 你的名字
              <br />
              这里是楼层内容...
            </code>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>
                以 <code>#</code> 开头定义楼层
              </li>
              <li>
                格式：<code># &lt;楼层号&gt; &lt;作者名&gt;</code>
              </li>
              <li>
                例如：<code># 1L 楼主</code> 或 <code># 2L 路人甲</code>
              </li>
              <li>
                其中，作者名可以省略，省略则不显示。楼层号可以是任何字符串。
              </li>
            </ul>
          </section>

          <section>
            <h4 className="font-bold text-blue-600 mb-2 border-b pb-1">
              2. 多帖子分割
            </h4>
            <code className="block bg-gray-100 p-2 rounded mb-2 font-mono">
              !!! Post: 这是一个新帖子
              <br />
              <br />
              # 1L 新帖楼主
              <br />
              ...
            </code>
            <p className="text-gray-600">
              使用 <code>!!! Post: 标题</code> 来创建一个新的独立帖子。
            </p>
          </section>

          <section>
            <h4 className="font-bold text-blue-600 mb-2 border-b pb-1">
              3. 特殊功能
            </h4>
            <div className="space-y-3">
              <div>
                <span className="font-bold text-gray-800">
                  隐藏内容 (防剧透)
                </span>
                <code className="block bg-gray-100 p-1 rounded mt-1 font-mono">
                  ||会被遮住的内容||
                </code>
              </div>
              <div>
                <span className="font-bold text-gray-800">
                  贴图
                </span>
                <code className="block bg-gray-100 p-1 rounded mt-1 font-mono">
                  ![图片描述，当图片裂了会显示的文字](图片链接)
                </code>
                <span className="text-xs text-gray-500">
                  图片链接需要是完整的URL，例如：<code>https://example.com/image.jpg</code>。也可以使用HTML方式渲染，详见下方教程。
                </span>
              </div>            
              <div>
                <span className="font-bold text-gray-800">引用回复</span>
                <code className="block bg-gray-100 p-1 rounded mt-1 font-mono">
                  &gt; # 12L
                </code>
                <span className="text-xs text-gray-500">
                  会自动生成指向 12L 的链接。
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-800">
                  跨帖跳转/指定跳转
                </span>
                <code className="block bg-gray-100 p-1 rounded mt-1 font-mono">
                  [点击穿越](#post2)
                </code>
                <span className="text-xs text-gray-500">
                  跳转到第2个帖子，`postN`中N为第几个帖子。如果在括号内输入网站地址，那么可以跳转到外部网站。
                </span>
              </div>
              
              <div>
                 <span className="font-bold text-gray-800">
                    指定时间与头像
                 </span>
                 <code className="block bg-gray-100 p-1 rounded mt-1 font-mono break-all">
                    # 1L 某人[yesterday]&lt;"http://img..."&gt;
                 </code>
                 <span className="text-xs text-gray-500">
                    在作者名后使用 <code>[]</code> 自定义时间，使用 <code>&lt;""&gt;</code> (注意需要带英文引号) 自定义头像链接。
                 </span>
              </div>

              <div>
                 <span className="font-bold text-gray-800">
                    指定小尾巴 (客户端)
                 </span>
                 <code className="block bg-gray-100 p-1 rounded mt-1 font-mono">
                    # 5L 路人<br/>
                    内容...<br/>
                    --来自 iPhone 16
                 </code>
                 <span className="text-xs text-gray-500">
                    在回复内容的<b>最后一行</b>使用 <code>--</code> 开头，可以强制指定该楼层的小尾巴。
                 </span>
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="flex flex-col items-center">
              <a 
                href="https://www.runoob.com/markdown/md-tutorial.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mb-0.5"
              >
                Markdown 教程
              </a>
              <span className="text-[10px] text-gray-400 scale-90 origin-top">不一定全支持</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
