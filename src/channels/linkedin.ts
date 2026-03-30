/**
 * LinkedIn channel — check if linkedin-scraper-mcp is available.
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

export class LinkedInChannel extends Channel {
  readonly name = "linkedin";
  readonly description = "LinkedIn professional network";
  readonly backends = ["linkedin-scraper-mcp", "Jina Reader"];
  readonly tier = 2 as const;

  canHandle(url: string): boolean {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return hostname === "linkedin.com" || hostname.endsWith(".linkedin.com");
    } catch {
      return false;
    }
  }

  check(_config?: ChannelConfig): CheckResult {
    const mcporter = which("mcporter");
    if (!mcporter) {
      return {
        status: "off",
        message:
          "Basic content available via Jina Reader. Full features require:\n" +
          "  pip install linkedin-scraper-mcp\n" +
          "  mcporter config add linkedin http://localhost:3000/mcp\n" +
          "  See: https://github.com/stickerdaniel/linkedin-mcp-server",
      };
    }

    try {
      const result = spawnSync(mcporter, ["config", "list"], {
        encoding: "utf-8",
        timeout: 5000,
      });
      if (result.stdout && result.stdout.toLowerCase().includes("linkedin")) {
        return {
          status: "ok",
          message: "Fully available (profile, company, job search)",
        };
      }
    } catch {
      // fall through
    }

    return {
      status: "off",
      message:
        "mcporter installed but LinkedIn MCP not configured. Run:\n" +
        "  pip install linkedin-scraper-mcp\n" +
        "  mcporter config add linkedin http://localhost:3000/mcp",
    };
  }
}
