#!/usr/bin/env node
/**
 * Agent Reach CLI — TypeScript edition.
 *
 * Usage:
 *   agent-reach-ts doctor
 *   agent-reach-ts version
 *   agent-reach-ts configure proxy http://user:pass@ip:port
 *   agent-reach-ts configure twitter-cookies AUTH_TOKEN CT0
 *   agent-reach-ts configure github-token TOKEN
 *   agent-reach-ts configure groq-key KEY
 */

import { AgentReach } from "./core";
import { Config } from "./config";

const VERSION = "1.3.0";

function printHelp(): void {
  console.log(`
Agent Reach v${VERSION} — Give your AI Agent eyes to see the entire internet.

Usage: agent-reach-ts <command> [options]

Commands:
  doctor                     Check platform availability
  version                    Show version
  configure <key> <value>    Set a config value
    Keys: proxy, twitter-cookies, github-token, groq-key, youtube-cookies

Examples:
  agent-reach-ts doctor
  agent-reach-ts configure proxy http://user:pass@ip:port
  agent-reach-ts configure twitter-cookies AUTH_TOKEN CT0
  agent-reach-ts configure github-token ghp_xxxxx
`);
}

function cmdDoctor(): void {
  const ar = new AgentReach();
  console.log(ar.doctorReport());
}

function cmdConfigure(args: string[]): void {
  const [key, ...valueParts] = args;
  const value = valueParts.join(" ");

  if (!key) {
    console.log("Usage: agent-reach-ts configure <key> <value>");
    console.log("Keys: proxy, twitter-cookies, github-token, groq-key, youtube-cookies");
    process.exit(1);
  }
  if (!value) {
    console.log(`Missing value for ${key}`);
    process.exit(1);
  }

  const config = new Config();

  switch (key) {
    case "proxy":
      config.set("reddit_proxy", value);
      console.log("✅ Proxy configured for Reddit!");
      break;

    case "twitter-cookies": {
      const parts = value.split(/\s+/);
      let authToken: string | undefined;
      let ct0: string | undefined;

      if (value.includes("auth_token=") && value.includes("ct0=")) {
        // Full cookie string
        for (const part of value.replace(/;/g, " ").split(/\s+/)) {
          if (part.startsWith("auth_token=")) authToken = part.slice("auth_token=".length);
          else if (part.startsWith("ct0=")) ct0 = part.slice("ct0=".length);
        }
      } else if (parts.length === 2 && !value.includes("=")) {
        [authToken, ct0] = parts;
      }

      if (authToken && ct0) {
        config.set("twitter_auth_token", authToken);
        config.set("twitter_ct0", ct0);
        console.log("✅ Twitter cookies configured!");
      } else {
        console.log("[X] Could not find auth_token and ct0 in your input.");
        console.log('   Accepted formats:');
        console.log("   1. agent-reach-ts configure twitter-cookies AUTH_TOKEN CT0");
        console.log('   2. agent-reach-ts configure twitter-cookies "auth_token=xxx; ct0=yyy; ..."');
        process.exit(1);
      }
      break;
    }

    case "youtube-cookies":
      config.set("youtube_cookies_from", value);
      console.log(`✅ YouTube cookie source configured: ${value}`);
      break;

    case "github-token":
      config.set("github_token", value);
      console.log("✅ GitHub token configured!");
      break;

    case "groq-key":
      config.set("groq_api_key", value);
      console.log("✅ Groq key configured!");
      break;

    default:
      console.log(`Unknown key: ${key}`);
      console.log("Keys: proxy, twitter-cookies, github-token, groq-key, youtube-cookies");
      process.exit(1);
  }
}

function main(): void {
  const [, , command, ...rest] = process.argv;

  if (!command) {
    printHelp();
    process.exit(0);
  }

  switch (command) {
    case "version":
      console.log(`Agent Reach v${VERSION}`);
      process.exit(0);
      break;

    case "doctor":
      cmdDoctor();
      break;

    case "configure":
      cmdConfigure(rest);
      break;

    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main();
