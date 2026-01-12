/**
 * Extract potential system names from user messages
 * 
 * This utility attempts to identify system names mentioned in user messages
 * using simple heuristics:
 * 1. Quoted text (e.g., "TrustID Biometric Verification Service")
 * 2. Capitalized phrases that look like system names
 * 3. Text after phrases like "the risk tier of", "what is", etc.
 */

export function extractSystemNames(message: string): string[] {
  const candidates: string[] = [];
  const trimmedMessage = message.trim();

  // 1. Extract quoted text (most reliable)
  const quotedMatches = trimmedMessage.match(/"([^"]+)"/g);
  if (quotedMatches) {
    quotedMatches.forEach(match => {
      const name = match.replace(/"/g, '').trim();
      if (name.length > 2) {
        candidates.push(name);
      }
    });
  }

  // 2. Look for patterns like "the [X] of [System Name]" or "what is [System Name]"
  const patternMatches = [
    /(?:the|what is|what's|tell me about|show me|analyze|check|look at)\s+(?:risk tier|risk level|compliance|status|details?|information)\s+(?:of|for)\s+([A-Z][A-Za-z0-9\s&-]+?)(?:\?|\.|$|,)/i,
    /(?:risk tier|risk level|compliance|status)\s+(?:of|for)\s+([A-Z][A-Za-z0-9\s&-]+?)(?:\?|\.|$|,)/i,
    /(?:what is|what's|tell me about|show me|analyze|check|look at)\s+([A-Z][A-Za-z0-9\s&-]+?)(?:\?|\.|$|,)/i,
  ];

  patternMatches.forEach(pattern => {
    const matches = trimmedMessage.match(pattern);
    if (matches && matches[1]) {
      const name = matches[1].trim();
      // Filter out common words that aren't system names
      if (name.length > 3 && !/^(The|This|That|My|Our|Your|Their|What|How|When|Where|Why)$/i.test(name)) {
        candidates.push(name);
      }
    }
  });

  // 3. Look for capitalized phrases (potential system names)
  // Match sequences of capitalized words (at least 2 words, each starting with capital)
  const capitalizedPhrases = trimmedMessage.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g);
  if (capitalizedPhrases) {
    capitalizedPhrases.forEach(phrase => {
      const words = phrase.trim().split(/\s+/);
      // Only consider if it's 2+ words and doesn't look like a sentence start
      if (words.length >= 2 && words[0].length > 2) {
        // Filter out common sentence starters
        if (!/^(The|This|That|My|Our|Your|Their|What|How|When|Where|Why|Please|Can|Could|Should|Would|Will)$/i.test(words[0])) {
          candidates.push(phrase.trim());
        }
      }
    });
  }

  // Remove duplicates and return
  return Array.from(new Set(candidates.map(c => c.trim()).filter(c => c.length > 2)));
}
