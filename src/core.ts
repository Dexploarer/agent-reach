/**
 * AgentReach — TypeScript core class.
 *
 * Provides health-check functionality for all retained channels.
 * After installation, agents call the upstream tools directly.
 */

import { Config } from "./config";
import { checkAll, formatReport, ChannelReport } from "./doctor";

export { Config } from "./config";
export { checkAll, formatReport } from "./doctor";
export * from "./channels";

export class AgentReach {
  readonly config: Config;

  constructor(config?: Config) {
    this.config = config ?? new Config();
  }

  /** Check all channel availability. */
  doctor(): Record<string, ChannelReport> {
    return checkAll(this.config);
  }

  /** Get formatted health report. */
  doctorReport(): string {
    return formatReport(checkAll(this.config));
  }
}
