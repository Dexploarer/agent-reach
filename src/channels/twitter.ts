/**
 * Twitter/X channel — check if bird CLI is available and authenticated.
 */

import { execSync, spawnSync } from "child_process";
import { Channel, ChannelConfig, CheckResult } from "./base";

function which(cmd: string): string | null {
  try {
    const result = execSync(`which ${cmd} 2>/dev/null`, { encoding: "utf-8" }).trim();
    return result || null;
  } catch {
    return null;
  }
}

export class TwitterChannel extends Channel {
  readonly name = "twitter";
  readonly description = "Twitter/X posts and search";
  readonly backends = ["bird CLI"];
  readonly tier = 2 as const;

  canHandle(url: string): boolean {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return (
        hostname.includes("twitter.com") ||
        hostname.includes("x.com") ||
        hostname.includes("t.co")
      );
    } catch {
      return false;
    }
  }

  check(_config?: ChannelConfig): CheckResult {
    const bird = which("bird") || which("birdx");
    if (!bird) {
      return {
        status: "warn",
        message:
          "bird CLI not installed. Install:\n" +
          "  npm install -g @steipete/bird\n" +
          "  Then run: agent-reach configure twitter-cookies AUTH_TOKEN CT0",
      };
    }

    try {
      const result = spawnSync(bird, ["check"], {
        encoding: "utf-8",
        timeout: 5000,
      });
      if (result.status === 0) {
        return { status: "ok", message: "Fully available (read, search, timeline, post)" };
      }
      const stderr = result.stderr || "";
      if (stderr.includes("Missing credentials")) {
        return {
          status: "warn",
          message:
            "bird CLI installed but authentication not configured.\n" +
            "  Run: agent-reach configure twitter-cookies AUTH_TOKEN CT0",
        };
      }
      return {
        status: "warn",
        message:
          "bird CLI authentication check failed.\n" +
          "  Run: bird check  (to see details)",
      };
    } catch {
      return {
        status: "warn",
        message: "bird CLI status check failed. Run: bird check",
      };
    }
  }
}
