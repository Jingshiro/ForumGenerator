import { Post, Thread } from '../types';

/**
 * Generates a simpler ID.
 * Now scoped by thread index to avoid collisions.
 */
const generateId = (threadIndex: number, floorRaw: string) => {
  const safeFloor = floorRaw.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-');
  const id = `thread-${threadIndex}-floor-${safeFloor}`;
  // console.log('[Parser] Generated ID:', id, 'for floor:', floorRaw); // Too noisy usually, but let's enable if needed.
  return id;
};

/**
 * Parses raw markdown into multiple threads.
 * 
 * Syntax:
 * !!! Post: Title
 * Content...
 * 
 * # Floor [Author]
 * Content...
 */
export const parseMarkdownToThreads = (markdown: string): Thread[] => {
  // 1. Split by "!!! Post:" delimiter
  // Regex looks for "!!! Post:" at start of line, case insensitive
  // The first chunk might be a thread without a title if user didn't specify "!!! Post" at very top
  const threadChunks = markdown.split(/^!!!\s*Post\s*[:：]?\s*(.*)$/gim);
  
  const threads: Thread[] = [];
  
  // If the file doesn't start with "!!! Post", the first element is content of the first thread (default)
  // If it does, split results in: ["", "Title1", "Content1", "Title2", "Content2"]
  

  
  if (markdown.trim().match(/^!!!\s*Post/i)) {
      // Starts with explicit post
      // loop from index 1, pairs of Title + Content
      for (let i = 1; i < threadChunks.length; i += 2) {
          const title = threadChunks[i].trim() || `帖子 ${Math.ceil(i/2)}`;
          const content = threadChunks[i+1];
          threads.push(parseSingleThread(content, title, threads.length));
      }
  } else {
      // No explicit post separator, treat whole file as one thread
      // But wait, user might add "!!! Post" later in file.
      // logic: split results in [Content0, Title1, Content1...]
      if (threadChunks.length > 0) {
          threads.push(parseSingleThread(threadChunks[0], "默认帖子", 0));
          
          for (let i = 1; i < threadChunks.length; i += 2) {
            const title = threadChunks[i].trim() || `帖子 ${Math.floor(i/2) + 1}`;
            const content = threadChunks[i+1];
            threads.push(parseSingleThread(content, title, threads.length));
        }
      }
  }
  
  return threads;
};

const parseSingleThread = (content: string, title: string, threadIndex: number): Thread => {
    const lines = content.split('\n');
    const posts: Post[] = [];
    
    let currentPost: Partial<Post> | null = null;
    let currentContent: string[] = [];
    
    // Regex: # FloorName [Author]
    // OR: # FloorName Author (no brackets)
    // OR: # FloorName Author [Timestamp]
    // We want to capture:
    // 1. Floor ID
    // 2. Author + Timestamp (rest of line)
    
    // Updated Logic:
    // Valid formats:
    // # 1L Name
    // # 1L Name[2024-01-01]
    // # 1L [Name][2024-01-01]
    
    // We treat everything after floor ID as "AuthorSegment". 
    // Then we look for the LAST [...] block in that segment as the potential Timestamp, 
    // IF the user intended it.
    // Simpler approach: Check if line ends with [...].
    
    const FLOOR_REGEX = /^#\s+(\S+)(.*)$/;

    const finalizePost = () => {
        if (currentPost) {
            let finalContent = currentContent.join('\n').trim();
            let clientTail = undefined;

            // Check for Tail Syntax: Last line starting with "--"
            // e.g. "--来自你的心里"
            // Regex: Last line matches ^--(.+)$
            const match = finalContent.match(/(?:^|\n)--(.+)$/);
            if (match) {
                // Check if it's really the last line/part
                
                // More robust: Split by lines, check last line
                const lines = finalContent.split('\n');
                const lastLine = lines[lines.length - 1].trim();
                if (lastLine.startsWith('--')) {
                    clientTail = lastLine.substring(2).trim(); // Remove '--'
                    // Reassemble content without last line
                    finalContent = lines.slice(0, lines.length - 1).join('\n').trim();
                }
            }
            
            currentPost.content = finalContent;
            currentPost.clientTail = clientTail;
            posts.push(currentPost as Post);
        }
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(FLOOR_REGEX);

        if (match) {
            finalizePost();
            
            const floorIdRaw = match[1].trim(); 
            let rest = match[2]?.trim() || '';
            
            // Syntax: # FloorName Author[Time]<"AvatarUrl">
            // The order of [Time] and <"AvatarUrl"> might vary if user is messy, 
            // but let's assume standard: Author part contains them.
            
            // We need to extract <"AvatarUrl">
            // Regex for <" ... ">
            const avatarMatch = rest.match(/<"(.*?)">/);
            let specificAvatar: string | undefined = undefined;
            
            if (avatarMatch) {
                specificAvatar = avatarMatch[1];
                // Remove from rest to avoid it being part of author/time
                rest = rest.replace(avatarMatch[0], '').trim();
            }

            let authorRaw = rest;
            let manualTimestamp: string | undefined = undefined;

            // Check for manual timestamp [xxxxx] at the end
            // Be careful to match the LAST set of brackets if multiple exist
            const timeMatch = rest.match(/^(.*)\[(.*?)\]$/);
            if (timeMatch) {
               // Potential match.
               // timeMatch[1] = Author part
               // timeMatch[2] = Timestamp part
               // Need to ensure it's not actually part of the name like "Author[Tag]"
               // BUT per requirement logic: "# 1L 吃瓜路人[2025-01-27 17:58]"
               // So we assume the last bracket group is timestamp.
               authorRaw = timeMatch[1].trim();
               manualTimestamp = timeMatch[2].trim();
            }
            
            // Clean author: remove leading/trailing brackets if user used them like [Author]
            // Case: [Author]
            if (authorRaw.startsWith('[') && authorRaw.endsWith(']')) {
                authorRaw = authorRaw.slice(1, -1);
            }
            // If empty, default
            if (!authorRaw) authorRaw = '匿名用户';

            currentPost = {
                id: generateId(threadIndex, floorIdRaw),
                floorId: floorIdRaw,
                author: authorRaw,
                avatar: specificAvatar,
                isLZ: ['LZ', '楼主', 'PO'].includes(floorIdRaw.toUpperCase()) || floorIdRaw.includes('楼主'),
                timestamp: undefined, // Will be calculated by timeUtils
                manualTimestamp, 
                threadId: `thread-${threadIndex}`
            };
            currentContent = [];
        } else {
            // Process spoilers and links
            let processedLine = line;

            // Spoiler: ||text|| -> clickable span (handled by global listener)
            processedLine = processedLine.replace(/\|\|(.+?)\|\|/g, '<span class="spoiler">$1</span>');

            // Reply Link: > # 12L -> Link to anchor
            // We need to link to the ID in *this* thread.
            processedLine = processedLine.replace(/^>\s*#\s*(.+)$/gm, (_, floorTarget) => {
                // Must match the ID generation logic: thread-X-floor-Y
                // We generate the target ID assuming it's in the same thread
                const targetId = generateId(threadIndex, floorTarget.trim());
                return `> [回复 ${floorTarget}](#${targetId})`; 
            });

            if (currentPost) {
                currentContent.push(processedLine);
            } else {
                 // Content before first floor (e.g. thread intro before LZ)
                 // We can auto-create a "0L" or "Topic" post if needed, or just append to "LZ" if it comes later?
                 // For now, if no currentPost, we drop it or treat as "Thread Info" (ignoring for MVP)
            }
        }
    }
    finalizePost();

    return {
        id: `thread-${threadIndex}`,
        title,
        posts
    };
};

export const INITIAL_CONTENT = `!!! Post: 【昌平路】决赛吃瓜路人观赛楼
# LZ 楼主
你昌总决赛今晚7点开打，来浅开一个观赛吃瓜楼
## HY vs LD
不要吵架不要撕逼虽然我知道今晚这阵容难免一撕但补要在我楼撕啊——
先放个草台班子的赛前预告
[dianbuliao.tv](https://诈骗链接.com)
![图裂了是正常的](https://诈骗/?.png)
[隔壁CP粉围观楼](#post2)

# 1L
前排出售瓜子汽水！草台班子这次的预告整得还挺像模像样的

# 2L
来了来了！今晚能打到巅峰对决吗！

# 3L
># 1L
主要是G一串长得好看

# 4L
踩一脚我的废物4强主队进来看看

# 5L
># 3L
你说哪个G一串

# 6L
># 5L
这还用问？显然是👻啊，乱码哥不是靠着就是坐着，就最后大镜头露了个正脸，我笑死

# 7L
># 6L
鬼杂一如既往脸大

# 8L
># 6L
下群了？

# 9L
># 7L
说事实也不行？

# 10L
收。
所以什么时候出垃圾话，很急，想学乱码哥骂人
||但是有一说一，你昌长得像个人的挺多的吧||


!!! Post: 但偏偏雨渐渐大到我看你不见（懂的进）

# 1L LZ
再见不能红着脸，至少也要红着眼
有gn陪我唠唠嘛

# 2L
没想到我也有喵姐的一天……！
对下暗号，是一起吃过烤肠的小朋友们吗？

# 3L
># 2L
是他们QAQQQ！！！
我泪崩了，曾经那么好怎么现在这样……

# 4L
woc，看到烤肠已经开始哭了，记得西那天赛后说他想跟喵分享以后的每一个mvp
后来他们都拿到了很多的mvp，但再也不是可以跟对方分享的了
啊啊啊啊啊

# 5L
进来认亲了！那天正好在下雨，是吧？`;
