/**
 * Configuration management for Agent Reach.
 *
 * Stores settings in ~/.agent-reach/config.yaml.
 * Auto-creates directory on first use.
 * Mirrors the Python Config class behaviour.
 */

import * as fs from "fs";
import * as os from "os";
import * as path from "path";

/** Features that require specific config keys to be set. */
const FEATURE_REQUIREMENTS: Record<string, string[]> = {
  exa_search: ["exa_api_key"],
  reddit_proxy: ["reddit_proxy"],
  twitter_xreach: ["twitter_auth_token", "twitter_ct0"],
  groq_whisper: ["groq_api_key"],
  github_token: ["github_token"],
};

/** Simple key=value YAML serialiser (supports string/number/boolean values only). */
function dumpSimpleYaml(data: Record<string, unknown>): string {
  return Object.entries(data)
    .map(([k, v]) => {
      if (v === null || v === undefined) return `${k}: null`;
      if (typeof v === "string") {
        // Quote strings that contain special YAML characters
        if (/[:#\[\]{},&*?|<>=!%@`'"\n\r]/.test(v) || v.trim() !== v) {
          return `${k}: '${v.replace(/'/g, "''")}'`;
        }
        return `${k}: ${v}`;
      }
      return `${k}: ${v}`;
    })
    .join("\n");
}

/** Very small YAML parser (supports flat key: value documents only). */
function parseSimpleYaml(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))
    ) {
      value = value.slice(1, -1);
    }
    if (value === "null") continue;
    result[key] = value;
  }
  return result;
}

export class Config {
  static readonly CONFIG_DIR = path.join(os.homedir(), ".agent-reach");
  static readonly CONFIG_FILE = path.join(Config.CONFIG_DIR, "config.yaml");

  readonly configPath: string;
  readonly configDir: string;
  private data: Record<string, string> = {};

  constructor(configPath?: string) {
    this.configPath = configPath ?? Config.CONFIG_FILE;
    this.configDir = path.dirname(this.configPath);
    this.ensureDir();
    this.load();
  }

  private ensureDir(): void {
    fs.mkdirSync(this.configDir, { recursive: true });
  }

  load(): void {
    if (fs.existsSync(this.configPath)) {
      const text = fs.readFileSync(this.configPath, "utf-8");
      this.data = parseSimpleYaml(text);
    } else {
      this.data = {};
    }
  }

  save(): void {
    this.ensureDir();
    const content = dumpSimpleYaml(this.data) + (Object.keys(this.data).length ? "\n" : "");
    // Write with restricted permissions (0600) — owner read/write only
    const fd = fs.openSync(this.configPath, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_TRUNC, 0o600);
    fs.writeSync(fd, content);
    fs.closeSync(fd);
  }

  /**
   * Get a config value. Also checks environment variables (uppercase key).
   */
  get(key: string, defaultValue?: string): string | undefined {
    if (key in this.data) return this.data[key];
    const envVal = process.env[key.toUpperCase()];
    if (envVal) return envVal;
    return defaultValue;
  }

  /** Set a config value and persist to disk. */
  set(key: string, value: string): void {
    this.data[key] = value;
    this.save();
  }

  /** Delete a config key and persist to disk. */
  delete(key: string): void {
    delete this.data[key];
    this.save();
  }

  /** Check if a named feature has all required config keys set. */
  isConfigured(feature: string): boolean {
    const required = FEATURE_REQUIREMENTS[feature] ?? [];
    return required.every((k) => !!this.get(k));
  }

  /** Return status of all optional features. */
  getConfiguredFeatures(): Record<string, boolean> {
    return Object.fromEntries(
      Object.keys(FEATURE_REQUIREMENTS).map((f) => [f, this.isConfigured(f)])
    );
  }

  /** Return config as a dict with sensitive values masked. */
  toDict(): Record<string, string | null> {
    const masked: Record<string, string | null> = {};
    for (const [k, v] of Object.entries(this.data)) {
      if (["key", "token", "password", "proxy"].some((s) => k.toLowerCase().includes(s))) {
        masked[k] = v ? `${v.slice(0, 8)}...` : null;
      } else {
        masked[k] = v ?? null;
      }
    }
    return masked;
  }
}
