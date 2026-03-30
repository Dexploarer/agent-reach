/**
 * Exa Search channel — check if mcporter + Exa MCP is available.
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

export class ExaSearchChannel extends Channel {
  readonly name = "exa_search";
  readonly description = "Semantic web search";
  readonly backends = ["Exa via mcporter"];
  readonly tier = 0 as const;

  canHandle(_url: string): boolean {
    return false; // Search-only channel
  }

  check(_config?: ChannelConfig): CheckResult {
    const mcporter = which("mcporter");
    if (!mcporter) {
      return {
        status: "off",
        message:
          "Requires mcporter + Exa MCP. Install:\n" +
          "  npm install -g mcporter\n" +
          "  mcporter config add exa https://mcp.exa.ai/mcp",
      };
    }

    try {
      const result = spawnSync(mcporter, ["config", "list"], {
        encoding: "utf-8",
        timeout: 5000,
      });
      if (result.stdout && result.stdout.toLowerCase().includes("exa")) {
        return { status: "ok", message: "Semantic web search available (free, no API key needed)" };
      }
      return {
        status: "off",
        message:
          "mcporter installed but Exa not configured. Run:\n" +
          "  mcporter config add exa https://mcp.exa.ai/mcp",
      };
    } catch {
      return { status: "off", message: "mcporter connection error" };
    }
  }
}
