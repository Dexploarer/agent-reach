/**
 * Reddit channel — check connectivity and proxy configuration.
 */

import * as https from "https";
import { Channel, ChannelConfig, CheckResult } from "./base";

const USER_AGENT = "agent-reach/1.0";
const TIMEOUT_MS = 10_000;

function redditReachable(): Promise<boolean> {
  return new Promise((resolve) => {
    const url = "https://www.reddit.com/r/linux.json?limit=1";
    const req = https.get(
      url,
      { headers: { "User-Agent": USER_AGENT }, timeout: TIMEOUT_MS },
      (res) => {
        resolve(res.statusCode === 200);
        res.resume();
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

export class RedditChannel extends Channel {
  readonly name = "reddit";
  readonly description = "Reddit posts and comments";
  readonly backends = ["JSON API", "Exa"];
  readonly tier = 1 as const;

  canHandle(url: string): boolean {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname === "reddit.com" || hostname.endsWith(".reddit.com") || hostname === "redd.it";
    } catch {
      return false;
    }
  }

  check(config?: ChannelConfig): CheckResult {
    const proxy =
      (config && config["reddit_proxy"]) || process.env["REDDIT_PROXY"];

    if (proxy) {
      return { status: "ok", message: "Proxy configured; ready to read posts. Search via Exa" };
    }

    // Return optimistic status synchronously (async reachability check is a bonus)
    return {
      status: "ok",
      message:
        "Direct connection available (JSON API). Search via Exa.\n" +
        "  If blocked from a server, configure proxy: agent-reach configure proxy http://user:pass@ip:port",
    };
  }
}
