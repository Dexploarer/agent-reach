/**
 * TypeScript tests for channel registry and health checks.
 */

import { getAllChannels, getChannel } from "../channels";

describe("Channel Registry", () => {
  test("all channels are registered", () => {
    const channels = getAllChannels();
    expect(channels.length).toBeGreaterThan(0);
    const names = channels.map((ch) => ch.name);
    expect(names).toContain("web");
    expect(names).toContain("github");
    expect(names).toContain("youtube");
    expect(names).toContain("reddit");
    expect(names).toContain("rss");
    expect(names).toContain("twitter");
    expect(names).toContain("linkedin");
  });

  test("channel names are unique", () => {
    const channels = getAllChannels();
    const names = channels.map((ch) => ch.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test("getChannel returns correct channel", () => {
    const ch = getChannel("github");
    expect(ch).toBeDefined();
    expect(ch!.name).toBe("github");
  });

  test("getChannel returns undefined for unknown channel", () => {
    expect(getChannel("not-exists")).toBeUndefined();
  });

  test("all channels have valid properties", () => {
    for (const ch of getAllChannels()) {
      expect(typeof ch.name).toBe("string");
      expect(ch.name.length).toBeGreaterThan(0);
      expect(typeof ch.description).toBe("string");
      expect(ch.description.length).toBeGreaterThan(0);
      expect(Array.isArray(ch.backends)).toBe(true);
      expect([0, 1, 2]).toContain(ch.tier);
    }
  });

  test("no Asian market channels are registered", () => {
    const channels = getAllChannels();
    const names = channels.map((ch) => ch.name);
    // Ensure removed Asian channels are not present
    expect(names).not.toContain("bilibili");
    expect(names).not.toContain("douyin");
    expect(names).not.toContain("wechat");
    expect(names).not.toContain("weibo");
    expect(names).not.toContain("xiaohongshu");
    expect(names).not.toContain("xiaoyuzhou");
    expect(names).not.toContain("xueqiu");
    expect(names).not.toContain("v2ex");
  });
});

describe("Channel canHandle contract", () => {
  const urlSamples: Record<string, string> = {
    github: "https://github.com/panniantong/agent-reach",
    twitter: "https://x.com/user/status/1",
    youtube: "https://youtube.com/watch?v=abc",
    reddit: "https://reddit.com/r/python",
    linkedin: "https://www.linkedin.com/in/test",
    rss: "https://example.com/feed.xml",
    web: "https://example.com",
  };

  test("all channels return boolean from canHandle", () => {
    for (const ch of getAllChannels()) {
      const url = urlSamples[ch.name] ?? "https://example.com";
      const result = ch.canHandle(url);
      expect(typeof result).toBe("boolean");
    }
  });
});

describe("Channel check contract", () => {
  test("all channels return valid CheckResult", () => {
    for (const ch of getAllChannels()) {
      const result = ch.check();
      expect(["ok", "warn", "off", "error"]).toContain(result.status);
      expect(typeof result.message).toBe("string");
      expect(result.message.trim().length).toBeGreaterThan(0);
    }
  });
});
