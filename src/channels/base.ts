/**
 * Channel base interface — platform availability checking.
 *
 * Each channel represents a platform (YouTube, Twitter, GitHub, etc.)
 * and provides:
 *   - canHandle(url): does this URL belong to this platform?
 *   - check(config?): is the upstream tool installed and configured?
 *
 * After installation, agents call upstream tools directly.
 */

export type ChannelStatus = "ok" | "warn" | "off" | "error";

export interface CheckResult {
  status: ChannelStatus;
  message: string;
}

export interface ChannelConfig {
  [key: string]: string | undefined;
}

export abstract class Channel {
  /** Platform identifier, e.g. "youtube" */
  abstract readonly name: string;
  /** Human-readable description */
  abstract readonly description: string;
  /** Upstream tool(s) used, e.g. ["yt-dlp"] */
  abstract readonly backends: string[];
  /** 0=zero-config, 1=needs free key, 2=needs setup */
  abstract readonly tier: 0 | 1 | 2;

  /** Returns true if this channel can handle the given URL. */
  abstract canHandle(url: string): boolean;

  /**
   * Check if this channel's upstream tool is available.
   * Returns a CheckResult with status and descriptive message.
   */
  check(_config?: ChannelConfig): CheckResult {
    return {
      status: "ok",
      message: this.backends.length > 0 ? this.backends.join(", ") : "built-in",
    };
  }
}
