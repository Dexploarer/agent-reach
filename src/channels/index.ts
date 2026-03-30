/**
 * Channel registry — lists all supported platforms for doctor checks.
 */

export { Channel, ChannelStatus, CheckResult, ChannelConfig } from "./base";
export { YouTubeChannel } from "./youtube";
export { WebChannel } from "./web";
export { GitHubChannel } from "./github";
export { LinkedInChannel } from "./linkedin";
export { RedditChannel } from "./reddit";
export { RSSChannel } from "./rss";
export { TwitterChannel } from "./twitter";
export { ExaSearchChannel } from "./exaSearch";

import { Channel } from "./base";
import { YouTubeChannel } from "./youtube";
import { WebChannel } from "./web";
import { GitHubChannel } from "./github";
import { LinkedInChannel } from "./linkedin";
import { RedditChannel } from "./reddit";
import { RSSChannel } from "./rss";
import { TwitterChannel } from "./twitter";
import { ExaSearchChannel } from "./exaSearch";

export const ALL_CHANNELS: Channel[] = [
  new GitHubChannel(),
  new TwitterChannel(),
  new YouTubeChannel(),
  new RedditChannel(),
  new LinkedInChannel(),
  new RSSChannel(),
  new ExaSearchChannel(),
  new WebChannel(),
];

/** Get a channel by name. Returns undefined if not found. */
export function getChannel(name: string): Channel | undefined {
  return ALL_CHANNELS.find((ch) => ch.name === name);
}

/** Get all registered channels. */
export function getAllChannels(): Channel[] {
  return ALL_CHANNELS;
}
