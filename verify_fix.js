const pattern = "*://*.kone.kingdee.com/*";
const url = "https://kone.kingdee.com/certexam/answer?exam=2359788198512560128&source=B";

function convertPatternToRegex(pattern) {
    let regexStr = pattern;

    // Handle ://*. case to make subdomain optional
    if (regexStr.includes('://*.')) {
        regexStr = regexStr.replace('://*.', '://(?:.*\\.)?');
    }

    // Escape dots
    regexStr = regexStr.replace(/\./g, '\\.');

    // Replace * with .* (but be careful not to replace the * we just added in (?:.*\\.)?)
    // Wait, if I replaced ://*. with ://(?:.*\\.)?, there are no * left from that part.
    // But (?:.*\\.)? contains * and .
    // So I should probably do the * replacement carefully.

    // Better approach:
    // 1. Split by ://
    // 2. Handle protocol
    // 3. Handle host/path

    // Alternative simple approach for this specific issue:
    // Just fix the regex string after generation?
    // Current: .*://.*\.kone\.kingdee\.com/.*
    // We want: .*://(?:.*\.)?kone\.kingdee\.com/.*

    // Let's try the simple approach first
    let r = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*');

    // Fix the specific case of .*://.*\.
    r = r.replace('://.*\\.', '://(?:.*\\.)?');

    return new RegExp(r);
}

const regex = convertPatternToRegex(pattern);
console.log('Regex:', regex);
console.log('Test:', regex.test(url));

// Test with www
const url2 = "https://www.kone.kingdee.com/foo";
console.log('Test www:', regex.test(url2));

// Test other patterns
const p3 = "*://google.com/*";
const r3 = convertPatternToRegex(p3);
console.log('Test google:', r3.test("https://google.com/foo"));
