// src/index-simple.ts
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Props } from "./props";
import { registerDateTool } from "./tools/date";
import { setupAppointmentTools } from "./tools/appointment";
import { registerEmailTools } from "./tools/mail";
import { CalendarReminderService } from "./automation/calendarreminder";
import { Hono } from "hono";

type Env = { 
  AI: any;
  GOOGLE_ACCESS_TOKEN: string;
  WORKOS_CLIENT_ID: string;
  WORKOS_CLIENT_SECRET: string;
  OAUTH_KV: KVNamespace;
  MCP_OBJECT: DurableObjectNamespace;
};

export class MyMCP extends McpAgent<Env, unknown, Props> {
  server = new McpServer({
    name: "Google Calendar MCP (Simple)",
    version: "1.0.0",
  });

  private reminderService: CalendarReminderService | null = null;

  async init() {
    // Register tools directly
    registerDateTool(this.server);
    setupAppointmentTools(this.server, this.env);
    registerEmailTools(this.server);

    // Initialize and start the calendar reminder service
    this.reminderService = new CalendarReminderService(this.env);
    await this.reminderService.startReminderAutomation();
  }

  async cleanup() {
    if (this.reminderService) {
      await this.reminderService.cleanup();
      this.reminderService = null;
    }
  }
}

// Simple Hono app without OAuth
const app = new Hono<{ Bindings: Env }>();

// Health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Google Calendar MCP Server",
    endpoints: {
      sse: "/sse",
      health: "/health"
    }
  });
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Mount MCP SSE endpoint directly (no OAuth)
app.all("/sse/*", MyMCP.mount("/sse") as any);

export default app;
