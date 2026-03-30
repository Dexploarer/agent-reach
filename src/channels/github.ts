/**
 * GitHub channel — check if gh CLI is available.
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

export class GitHubChannel extends Channel {
  readonly name = "github";
  readonly description = "GitHub repositories and code";
  readonly backends = ["gh CLI"];
  readonly tier = 0 as const;

  canHandle(url: string): boolean {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname === "github.com" || hostname.endsWith(".github.com");
    } catch {
      return false;
    }
  }

  check(_config?: ChannelConfig): CheckResult {
    const gh = which("gh");
    if (!gh) {
      return { status: "warn", message: "gh CLI not installed. Install: https://cli.github.com" };
    }

    try {
      const result = spawnSync(gh, ["auth", "status"], {
        encoding: "utf-8",
        timeout: 5000,
      });
      if (result.status === 0) {
        return {
          status: "ok",
          message: "Fully available (read, search, fork, issue, PR, etc.)",
        };
      }
      return {
        status: "warn",
        message: "gh CLI installed but not authenticated. Run `gh auth login` for full access",
      };
    } catch {
      return {
        status: "warn",
        message: "gh CLI status check failed. Run `gh auth status` for details",
      };
    }
  }
}
