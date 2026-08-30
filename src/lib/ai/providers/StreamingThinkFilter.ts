/**
 * Zero-leak Streaming Think Filter
 * Safely filters out <think>...</think> reasoning tags and contents
 * across chunk boundaries in real-time token streams without swallowing normal text.
 */

export class StreamingThinkFilter {
  private insideThink = false;
  private pendingBuffer = '';

  /**
   * Processes an incoming text chunk and returns the visible text to emit.
   */
  process(chunk: string): string {
    if (!chunk) return '';
    this.pendingBuffer += chunk;
    let output = '';

    while (this.pendingBuffer.length > 0) {
      if (!this.insideThink) {
        const startIdx = this.pendingBuffer.indexOf('<think>');
        if (startIdx !== -1) {
          // Emit content before <think>
          output += this.pendingBuffer.slice(0, startIdx);
          this.insideThink = true;
          this.pendingBuffer = this.pendingBuffer.slice(startIdx + '<think>'.length);
          continue;
        }

        // Check if pendingBuffer ends with a prefix of '<think>' (e.g. '<', '<t', '<th', '<thi', '<thin')
        const thinkTag = '<think>';
        let potentialPrefixLen = 0;
        for (let i = 1; i < thinkTag.length; i++) {
          const prefix = thinkTag.slice(0, i);
          if (this.pendingBuffer.endsWith(prefix)) {
            potentialPrefixLen = prefix.length;
            break;
          }
        }

        if (potentialPrefixLen > 0) {
          // Emit everything before the possible prefix and keep the prefix in the buffer
          const safeLen = this.pendingBuffer.length - potentialPrefixLen;
          output += this.pendingBuffer.slice(0, safeLen);
          this.pendingBuffer = this.pendingBuffer.slice(safeLen);
          break;
        }

        // No <think> tag or prefix found; emit all pending buffer
        output += this.pendingBuffer;
        this.pendingBuffer = '';
        break;
      } else {
        // Inside <think> tag
        const endIdx = this.pendingBuffer.indexOf('</think>');
        if (endIdx !== -1) {
          // Exited reasoning mode
          this.insideThink = false;
          this.pendingBuffer = this.pendingBuffer.slice(endIdx + '</think>'.length);
          continue;
        }

        // Check if pendingBuffer ends with a prefix of '</think>' (e.g. '<', '</', '</t', '</th', '</thi', '</thin')
        const endTag = '</think>';
        let potentialPrefixLen = 0;
        for (let i = 1; i < endTag.length; i++) {
          const prefix = endTag.slice(0, i);
          if (this.pendingBuffer.endsWith(prefix)) {
            potentialPrefixLen = prefix.length;
            break;
          }
        }

        if (potentialPrefixLen > 0) {
          // Discard everything before the possible end tag prefix, keep only prefix
          const keepFrom = this.pendingBuffer.length - potentialPrefixLen;
          this.pendingBuffer = this.pendingBuffer.slice(keepFrom);
          break;
        }

        // Still inside thinking tag with no end tag prefix in sight; discard entire buffer
        this.pendingBuffer = '';
        break;
      }
    }

    return output;
  }

  /**
   * Flushes any remaining pending buffer at stream completion.
   */
  flush(): string {
    if (!this.insideThink && this.pendingBuffer.length > 0) {
      const remaining = this.pendingBuffer;
      this.pendingBuffer = '';
      return remaining;
    }
    this.pendingBuffer = '';
    return '';
  }

  /**
   * Synchronously cleans complete static text.
   */
  static cleanStaticText(text: string): string {
    if (!text || typeof text !== 'string') return '';
    let cleaned = text.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim();
    if (cleaned.includes('</think>')) {
      const parts = cleaned.split('</think>');
      cleaned = parts[parts.length - 1].trim();
    }
    return cleaned;
  }
}
