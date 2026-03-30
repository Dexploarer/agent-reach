/**
 * McPorter configuration — defines MCP server endpoints.
 *
 * This TypeScript-compatible configuration mirrors config/mcporter.json
 * and provides type-safe access to MCP server settings.
 */

export interface McpServerConfig {
  /** Base URL for this MCP server */
  baseUrl?: string;
  /** Command to invoke (for local servers) */
  command?: string;
}

export interface McporterConfig {
  mcpServers: Record<string, McpServerConfig>;
  imports: string[];
}

/** Default mcporter configuration with retained (non-Asian) MCP servers. */
export const mcporterConfig: McporterConfig = {
  mcpServers: {
    exa: {
      baseUrl: "https://mcp.exa.ai/mcp",
    },
  },
  imports: [],
};

export default mcporterConfig;
