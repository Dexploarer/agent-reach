/**
 * TypeScript tests for Config class.
 */

import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Config } from "../config";

function makeTempConfig(): Config {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-reach-test-"));
  return new Config(path.join(tmpDir, "config.yaml"));
}

describe("Config", () => {
  test("get returns undefined for missing key", () => {
    const config = makeTempConfig();
    expect(config.get("nonexistent")).toBeUndefined();
  });

  test("set and get a value", () => {
    const config = makeTempConfig();
    config.set("test_key", "test_value");
    expect(config.get("test_key")).toBe("test_value");
  });

  test("get falls back to environment variable", () => {
    const config = makeTempConfig();
    process.env["TEST_ENV_KEY"] = "env_value";
    expect(config.get("test_env_key")).toBe("env_value");
    delete process.env["TEST_ENV_KEY"];
  });

  test("config file takes priority over env var", () => {
    const config = makeTempConfig();
    process.env["PRIORITY_KEY"] = "env_value";
    config.set("priority_key", "file_value");
    expect(config.get("priority_key")).toBe("file_value");
    delete process.env["PRIORITY_KEY"];
  });

  test("persists across reload", () => {
    const config = makeTempConfig();
    config.set("persistent_key", "persistent_value");
    const config2 = new Config(config.configPath);
    expect(config2.get("persistent_key")).toBe("persistent_value");
  });

  test("delete removes a key", () => {
    const config = makeTempConfig();
    config.set("delete_me", "value");
    config.delete("delete_me");
    expect(config.get("delete_me")).toBeUndefined();
  });

  test("isConfigured returns false when keys are missing", () => {
    const config = makeTempConfig();
    expect(config.isConfigured("exa_search")).toBe(false);
    // github_token may be available via GITHUB_TOKEN env var in CI; only test
    // when the environment variable is not set.
    if (!process.env["GITHUB_TOKEN"]) {
      expect(config.isConfigured("github_token")).toBe(false);
    }
  });

  test("isConfigured returns true when keys are set", () => {
    const config = makeTempConfig();
    config.set("github_token", "ghp_test123");
    expect(config.isConfigured("github_token")).toBe(true);
  });

  test("toDict masks sensitive values", () => {
    const config = makeTempConfig();
    config.set("api_key", "super_secret_key_value");
    config.set("normal_setting", "visible");
    const dict = config.toDict();
    expect(dict["api_key"]).toMatch(/\.\.\./);
    expect(dict["normal_setting"]).toBe("visible");
  });

  test("getConfiguredFeatures returns all features", () => {
    const config = makeTempConfig();
    const features = config.getConfiguredFeatures();
    expect(features).toHaveProperty("exa_search");
    expect(features).toHaveProperty("github_token");
  });
});
