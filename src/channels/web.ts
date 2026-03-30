/**
 * Web channel — any URL via Jina Reader. Always available.
 */

import { Channel, ChannelConfig, CheckResult } from "./base";

export class WebChannel extends Channel {
  readonly name = "web";
  readonly description = "Any webpage";
  readonly backends = ["Jina Reader"];
  readonly tier = 0 as const;

  canHandle(_url: string): boolean {
    return true; // Fallback — handles any URL
  }

  check(_config?: ChannelConfig): CheckResult {
    return {
      status: "ok",
      message: "Read any webpage via Jina Reader (curl https://r.jina.ai/URL)",
    };
  }
}
