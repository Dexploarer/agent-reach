/**
 * YouTube channel — check if yt-dlp is available with a JS runtime.
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Channel, ChannelConfig, CheckResult } from "./base";

function which(cmd: string): string | null {
  try {
    const result = execSync(`which ${cmd} 2>/dev/null`, { encoding: "utf-8" }).trim();
    return result || null;
  } catch {
    return null;
  }
}

export class YouTubeChannel extends Channel {
  readonly name = "youtube";
  readonly description = "YouTube videos and transcripts";
  readonly backends = ["yt-dlp"];
  readonly tier = 0 as const;

  canHandle(url: string): boolean {
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return (
        hostname === "youtube.com" ||
        hostname.endsWith(".youtube.com") ||
        hostname === "youtu.be"
      );
    } catch {
      return false;
    }
  }

  check(_config?: ChannelConfig): CheckResult {
    if (!which("yt-dlp")) {
      return { status: "off", message: "yt-dlp not installed. Install: pip install yt-dlp" };
    }

    const hasDeno = which("deno");
    const hasNode = which("node");

    if (!hasDeno && !hasNode) {
      return {
        status: "warn",
        message:
          "yt-dlp installed but missing JS runtime (required for YouTube).\n" +
          "  Install Node.js or Deno, then run: agent-reach install",
      };
    }

    if (!hasDeno) {
      const ytdlpConfig = path.join(os.homedir(), ".config", "yt-dlp", "config");
      let hasJsConfig = false;
      if (fs.existsSync(ytdlpConfig)) {
        hasJsConfig = fs.readFileSync(ytdlpConfig, "utf-8").includes("--js-runtimes");
      }
      if (!hasJsConfig) {
        return {
          status: "warn",
          message:
            "yt-dlp installed but JS runtime not configured. Run:\n" +
            "  mkdir -p ~/.config/yt-dlp && echo '--js-runtimes node' >> ~/.config/yt-dlp/config",
        };
      }
    }

    return { status: "ok", message: "Ready to extract video info and transcripts" };
  }
}
