import { Post, TimeConfig } from '../types';

/**
 * Parses a date string. Supports standard JS formats.
 * If invalid, returns original Date or current date as fallback.
 */
const safeParseDate = (dateStr: string): number => {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
};

/**
 * Formats a date to "YYYY-MM-DD HH:mm".
 */
const formatDate = (timestamp: number): string => {
    const d = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Calculates display timestamps for all posts in a thread based on configuration.
 * 
 * Logic:
 * 1. Collect all posts.
 * 2. Identify "Anchor Points" -> Posts with manual valid Timestamps.
 * 3. Fill in gaps between anchors using random increasing steps.
 * 
 * Simplified Logic (as per requirements):
 * - Random Mode: Generate strictly increasing times between Start and End.
 * - Manual Overrides: Take precedence and also act as new "current time" for subsequent random generation?
 *   - Ideally yes. If Post 5 is manually set to 10:00, Post 6 (random) should be > 10:00.
 *   - But if user sets Manual Time that is NOT a date (e.g. "Three years later"), we can't increment from it.
 *   - So:
 *     - Maintain a `currentSimulatedTime` cursor.
 *     - If Post has Manual Parsable Date -> set cursor to that date.
 *     - Else -> increment cursor by random step.
 *     - Assign cursor formatted string to `timestamp`.
 *     - If Post has Manual String (parsable or not) -> `displayTimestamp` = manual.
 *       (But valid date manual strings still update the background cursor for future posts).
 */
export const calculatePostTimes = (posts: Post[], config: TimeConfig): Record<string, string> => {
    const resultMap: Record<string, string> = {};
    
    // Limits
    const startMs = safeParseDate(config.startTime);
    const endMs = safeParseDate(config.endTime);
    
    // Validate range
    let range = endMs - startMs;
    if (range <= 0) range = 3600 * 1000 * 24; // Default 24h if invalid
    
    // Average step calculation (naive)
    // We want to fit N posts in Range.
    // Step = Range / N.
    // Randomize: Step * (0.5 ~ 1.5)
    const avgStep = range / (posts.length || 1);
    
    let currentCursor = startMs;

    posts.forEach(post => {
        // 1. Advance Cursor (Randomly)
        // logic: always move forward a bit from previous state
        // Add random variance: 0 to 20% of avg step? 
        // Or simply: currentCursor += avgStep * random(0.8, 1.2)
        // To ensure strict increasing, min step > 0
        
        // Better distribution: 
        // We want to reach EndTime exactly at end? Not necessarily.
        // Just strictly increasing is fine.
         
        const hasManual = !!post.manualTimestamp;
        let isManualDate = false;
        let manualTimeVal = 0;

        if (hasManual) {
            // Check if it's a valid date "2024-..." or "12:00"
            // Simple check: new Date(str) valid?
            const d = new Date(post.manualTimestamp!);
            if (!isNaN(d.getTime())) {
                isManualDate = true;
                manualTimeVal = d.getTime();
            }
        }

        // Logic Re-evaluation:
        // Requirement: "Strictly increasing" for randoms.
        // Mixed manual dates should respect the flow if possible.
        
        if (isManualDate) {
            // Update cursor to match manual date
            // But if manual date is BEHIND current cursor? 
            // e.g. Post 1: 10:00. Post 2 (Auto): 10:05. Post 3 (Manual): 09:00 (Flashback?)
            // If Flashback, we probably shouldn't set cursor back to 09:00 for Post 4. 
            // Post 4 should probably continue from 10:05? Or from 09:00?
            // Usually Forum order is chronological. If user manually writes a past date, they might want to reset?
            // Let's assume chronological for cursor update.
            if (manualTimeVal > currentCursor) {
                currentCursor = manualTimeVal;
            }
            // If manual date is older, we don't regress cursor, assuming it's a metadata anomaly, 
            // OR we do set it, trusting user knows what they are doing (timestamp flow break).
            // Let's set it. Trust user.
            currentCursor = manualTimeVal;
        } else {
             // Generate new time
             // Increment
             const randomFactor = 0.5 + Math.random(); // 0.5 ~ 1.5
             const step = avgStep * randomFactor;
             currentCursor += step;
             
             // Clamp to endTime? Maybe not strict, allowed to overflow if posts are many.
        }

        // Determine Display String
        if (config.mode === 'hidden') {
            if (hasManual) {
                resultMap[post.id] = post.manualTimestamp!;
            } else {
                resultMap[post.id] = ''; // Hide
            }
        } else {
            // Random Mode
            if (hasManual) {
                resultMap[post.id] = post.manualTimestamp!;
            } else {
                resultMap[post.id] = formatDate(currentCursor);
            }
        }
    });

    return resultMap;
};
