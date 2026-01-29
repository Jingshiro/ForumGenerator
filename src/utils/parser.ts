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
            const rest = match[2]?.trim() || '';
            
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

export const INITIAL_CONTENT = `!!! Post: 【树洞】我的徒弟好像想欺师灭祖
# LZ 楼主
大家好，虽然题目很惊悚，但其实还好。
主要是我最近发现他看我的眼神不对劲。

# 1L 吃瓜路人
前排。
楼主细说眼神。

# 2L [引 1L]
> # 1L
+1
顺便盲猜徒弟是魔尊。

!!! Post: 【求助】师尊误会我是魔尊怎么办
# LZ 徒弟 [委屈]
如题。
其实我只是修练了一门比较霸道的功法...

# 1L
哈哈哈哈哈哈隔壁楼主是你师尊吗？

# 2L
||点击查看剧透：其实真的是魔尊||
`;
