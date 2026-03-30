/**
 * RSS channel — check if a feedparser-equivalent is available.
 */

import { Channel, ChannelConfig, CheckResult } from "./base";

export class RSSChannel extends Channel {
  readonly name = "rss";
  readonly description = "RSS/Atom feeds";
  readonly backends = ["rss-parser"];
  readonly tier = 0 as const;

  canHandle(url: string): boolean {
    const lower = url.toLowerCase();
    return (
      lower.includes("/feed") ||
      lower.includes("/rss") ||
      lower.includes(".xml") ||
      lower.includes("atom")
    );
  }

  check(_config?: ChannelConfig): CheckResult {
    try {
      require.resolve("rss-parser");
      return { status: "ok", message: "Ready to read RSS/Atom feeds" };
    } catch {
      return {
        status: "warn",
        message: "rss-parser not installed. Install: npm install rss-parser",
      };
    }
  }
}
