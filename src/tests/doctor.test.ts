/**
 * TypeScript tests for the doctor module.
 */

import { checkAll, formatReport } from "../doctor";
import { Config } from "../config";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

function makeTempConfig(): Config {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agent-reach-test-"));
  return new Config(path.join(tmpDir, "config.yaml"));
}

describe("Doctor", () => {
  test("checkAll returns results for all channels", () => {
    const config = makeTempConfig();
    const results = checkAll(config);
    expect(Object.keys(results).length).toBeGreaterThan(0);

    for (const [name, report] of Object.entries(results)) {
      expect(typeof name).toBe("string");
      expect(["ok", "warn", "off", "error"]).toContain(report.status);
      expect(typeof report.message).toBe("string");
      expect(report.message.trim().length).toBeGreaterThan(0);
      expect(typeof report.name).toBe("string");
      expect([0, 1, 2]).toContain(report.tier);
      expect(Array.isArray(report.backends)).toBe(true);
    }
  });

  test("formatReport returns a non-empty string", () => {
    const config = makeTempConfig();
    const results = checkAll(config);
    const report = formatReport(results);
    expect(typeof report).toBe("string");
    expect(report.length).toBeGreaterThan(0);
    expect(report).toContain("Agent Reach Status");
  });
});
