/**
 * Environment health checker — powered by channels.
 *
 * Each channel knows how to check itself. Doctor just collects the results.
 */

import { Channel, CheckResult } from "./channels/base";
import { getAllChannels } from "./channels";
import { Config } from "./config";

export interface ChannelReport {
  status: string;
  name: string;
  message: string;
  tier: number;
  backends: string[];
}

/** Check all channels and return a status map keyed by channel name. */
export function checkAll(config?: Config): Record<string, ChannelReport> {
  const results: Record<string, ChannelReport> = {};
  for (const ch of getAllChannels()) {
    const { status, message } = ch.check(config ? Object.fromEntries(
      Object.entries(config.toDict()).map(([k, v]) => [k, v ?? undefined])
    ) : undefined);
    results[ch.name] = {
      status,
      name: ch.description,
      message,
      tier: ch.tier,
      backends: ch.backends,
    };
  }
  return results;
}

const STATUS_ICON: Record<string, string> = {
  ok: "✅",
  warn: "[!]",
  off: "[X]",
  error: "[X]",
};

/** Format results as a readable text report. */
export function formatReport(results: Record<string, ChannelReport>): string {
  const lines: string[] = [];
  lines.push("Agent Reach Status");
  lines.push("=".repeat(40));

  const okCount = Object.values(results).filter((r) => r.status === "ok").length;
  const total = Object.keys(results).length;

  // Tier 0 — zero config
  const tier0 = Object.entries(results).filter(([, r]) => r.tier === 0);
  if (tier0.length) {
    lines.push("");
    lines.push("Zero-config (works out of the box):");
    for (const [, r] of tier0) {
      const icon = STATUS_ICON[r.status] ?? "--";
      lines.push(`  ${icon}  ${r.name} — ${r.message}`);
    }
  }

  // Tier 1 — needs free key/setup
  const tier1 = Object.entries(results).filter(([, r]) => r.tier === 1);
  if (tier1.length) {
    lines.push("");
    lines.push("Search (unlock with mcporter):");
    for (const [, r] of tier1) {
      const icon = r.status === "ok" ? "✅" : "--";
      lines.push(`  ${icon}  ${r.name} — ${r.message}`);
    }
  }

  // Tier 2 — optional setup
  const tier2 = Object.entries(results).filter(([, r]) => r.tier === 2);
  if (tier2.length) {
    lines.push("");
    lines.push("Available after setup:");
    for (const [, r] of tier2) {
      const icon = STATUS_ICON[r.status] ?? "--";
      lines.push(`  ${icon}  ${r.name} — ${r.message}`);
    }
  }

  lines.push("");
  lines.push(`Status: ${okCount}/${total} channels available`);
  if (okCount < total) {
    lines.push("Run `agent-reach-ts setup` to unlock more channels");
  }

  return lines.join("\n");
}
