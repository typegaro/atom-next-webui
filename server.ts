import type {
  PluginRuntimeEvent,
  PluginSessionRuntime,
  UserMessagePart,
} from "@typegaro/atom-plugin";
import { existsSync, readFileSync, rmSync } from "fs";
import { basename, resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * MIME types map for static file serving.
 */
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

interface ImageInput {
  mimeType: string;
  data: string;
}

type ClientMsg =
  | { type: "submit"; text: string; images?: ImageInput[] }
  | { type: "interrupt" }
  | { type: "switch-model"; modelId: string }
  | { type: "load-session"; sessionId: string }
  | { type: "delete-session"; sessionId: string };

type BunWS = any;

export class NextWebUIServer {
  private readonly clients = new Set<BunWS>();
  private readonly pendingRuns = new Map<string, () => void>();
  private isRunning = false;
  private readonly unsubscribe: () => void;

  /** Path to the Next.js static export output */
  private readonly outDir: string;

  constructor(
    private readonly session: PluginSessionRuntime<"models" | "sessions">,
    private readonly sessionsDir: string,
  ) {
    this.unsubscribe = session.subscribe((event) => {
      this.handleRuntimeEvent(event);
    });
    // Resolve the out/ directory relative to the plugin root
    this.outDir = resolve(__dirname, "..", "out");
  }

  start(port: number): Promise<void> {
    const self = this;

    Bun.serve({
      port,
      hostname: "0.0.0.0",
      fetch(req: Request, server: any) {
        const url = new URL(req.url);

        // WebSocket upgrade
        if (url.pathname === "/ws") {
          if (server.upgrade(req)) return undefined;
          return new Response("WebSocket upgrade failed", { status: 500 });
        }

        // Serve static files from the Next.js export
        return self.serveStatic(url.pathname);
      },
      websocket: {
        open(ws: BunWS) {
          self.addClient(ws);
        },
        message(ws: BunWS, message: string | Buffer) {
          const str =
            typeof message === "string" ? message : message.toString();
          void self.onClientMsg(ws, str);
        },
        close(ws: BunWS) {
          self.clients.delete(ws);
          console.log("[next-webui] client disconnected");
        },
      },
    });

    return Promise.resolve();
  }

  /**
   * Serve a file from the Next.js static export.
   * Falls back to index.html for SPA-like routing.
   */
  private serveStatic(pathname: string): Response {
    // Normalize path — serve index.html for directory paths
    let filePath = pathname === "/" ? "/index.html" : pathname;

    const fullPath = resolve(this.outDir, filePath.slice(1));

    if (existsSync(fullPath)) {
      const ext = filePath.substring(filePath.lastIndexOf("."));
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const content = readFileSync(fullPath);
      return new Response(content, {
        headers: { "Content-Type": contentType },
      });
    }

    // Fallback: serve index.html (for client-side routing)
    const indexHtml = resolve(this.outDir, "index.html");
    if (existsSync(indexHtml)) {
      const content = readFileSync(indexHtml);
      return new Response(content, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not Found", { status: 404 });
  }

  private addClient(ws: BunWS): void {
    this.clients.add(ws);

    const models = this.session.listModels();
    const model = this.session.getActiveModelId();
    console.log(
      `[next-webui] client connected — model: ${model ?? "none"}, models: ${models.length}`,
    );

    ws.send(
      JSON.stringify({
        type: "ready",
        model,
        sessions: this.session.listSessions(),
        models,
        usage: this.session.getTotalUsage(),
        isRunning: this.isRunning,
      }),
    );
  }

  private sendTo(ws: BunWS, msg: object): void {
    ws.send(JSON.stringify(msg));
  }

  private broadcast(msg: object): void {
    const json = JSON.stringify(msg);
    for (const ws of this.clients) {
      ws.send(json);
    }
  }

  private handleRuntimeEvent(event: PluginRuntimeEvent): void {
    console.log(`[next-webui] event: ${event.type}`);

    // Intercept session-refresh events to reload and broadcast fresh session state
    if (event.type === "session-refresh") {
      const sessionId = (event as any).sessionId;
      if (sessionId) {
        console.log(`[next-webui] session-refresh for ${sessionId}, reloading...`);
        try {
          const freshEvents = this.session.loadSession(sessionId);
          this.broadcast({
            type: "session-refreshed",
            sessionId,
            events: freshEvents,
          });
        } catch (e) {
          console.error("[next-webui] session-refresh load error:", e);
        }
      }
      // Still forward the original event to clients
      this.broadcast({ type: "event", event });
      return;
    }

    this.broadcast({ type: "event", event });

    if (
      event.type === "done" ||
      event.type === "error" ||
      event.type === "interrupted"
    ) {
      const resolve = this.pendingRuns.get(event.runId);
      if (resolve) {
        this.pendingRuns.delete(event.runId);
        resolve();
      } else {
        console.warn(
          `[next-webui] no pending run for runId: ${event.runId}`,
        );
      }
    }
  }

  private async onClientMsg(ws: BunWS, raw: string): Promise<void> {
    let msg: ClientMsg;
    try {
      msg = JSON.parse(raw) as ClientMsg;
    } catch {
      return;
    }

    console.log(`[next-webui] client msg: ${msg.type}`);

    switch (msg.type) {
      case "submit": {
        if (this.isRunning) {
          this.sendTo(ws, { type: "busy" });
          return;
        }

        // Check for slash commands like /undo
        const trimmed = msg.text.trim();
        if (trimmed.startsWith("/")) {
          const command = trimmed.slice(1).trim().split(/\s+/)[0];
          if (command === "undo") {
            console.log(`[next-webui] executing /undo command`);
            this.isRunning = true;
            this.broadcast({ type: "run-start" });
            try {
              let resolve!: () => void;
              const done = new Promise<void>((r) => { resolve = r; });
              const { runId } = await this.session.submit({ type: "undo" });
              this.pendingRuns.set(runId, resolve);
              await done;
            } catch (e) {
              console.error("[next-webui] undo error:", e);
              this.broadcast({
                type: "event",
                event: { type: "error", error: String(e), runId: "" },
              });
            } finally {
              this.isRunning = false;
              this.broadcast({
                type: "run-end",
                usage: this.session.getTotalUsage(),
                model: this.session.getActiveModelId(),
                sessions: this.session.listSessions(),
              });
            }
            break;
          }
          // Unknown command — fall through to submit as text
          console.log(`[next-webui] unknown command: /${command}, submitting as text`);
        }

        const input = this.buildInput(msg.text, msg.images ?? []);
        if (input === null) return;

        this.isRunning = true;
        this.broadcast({ type: "run-start" });

        try {
          let resolve!: () => void;
          const done = new Promise<void>((r) => {
            resolve = r;
          });
          console.log(
            `[next-webui] submitting: ${JSON.stringify(input).slice(0, 80)}`,
          );
          const { runId } = await this.session.submit(
            input as string | UserMessagePart[],
          );
          console.log(`[next-webui] run started: ${runId}`);
          this.pendingRuns.set(runId, resolve);
          await done;
          console.log(`[next-webui] run complete: ${runId}`);
        } catch (e) {
          console.error("[next-webui] submit error:", e);
          this.broadcast({
            type: "event",
            event: { type: "error", error: String(e), runId: "" },
          });
        } finally {
          this.isRunning = false;
          this.broadcast({
            type: "run-end",
            usage: this.session.getTotalUsage(),
            model: this.session.getActiveModelId(),
            sessions: this.session.listSessions(),
          });
        }
        break;
      }

      case "interrupt":
        if (this.isRunning) this.session.interrupt();
        break;

      case "switch-model":
        try {
          this.session.switchModel(msg.modelId);
          const model = this.session.getActiveModelId();
          console.log(`[next-webui] switched model to: ${model}`);
          this.broadcast({ type: "model-changed", model });
        } catch (e) {
          console.error("[next-webui] switch-model error:", e);
          this.sendTo(ws, { type: "error", message: String(e) });
        }
        break;

      case "load-session":
        try {
          const events = this.session.loadSession(msg.sessionId);
          console.log(
            `[next-webui] loaded session ${msg.sessionId}: ${events.length} events`,
          );
          this.sendTo(ws, {
            type: "session-loaded",
            sessionId: msg.sessionId,
            events,
          });
        } catch (e) {
          console.error("[next-webui] load-session error:", e);
          this.sendTo(ws, { type: "error", message: String(e) });
        }
        break;

      case "delete-session":
        try {
          // Delete session file from disk
          const session = this.session.listSessions().find(
            (entry) => entry.id === msg.sessionId,
          );
          if (session) {
            const filePath = resolve(this.sessionsDir, `${basename(session.id)}.jsonl`);
            if (existsSync(filePath)) {
              rmSync(filePath, { force: true });
            }
          }
          const updatedSessions = this.session.listSessions();
          console.log(
            `[next-webui] deleted session ${msg.sessionId}, ${updatedSessions.length} remaining`,
          );
          this.broadcast({
            type: "session-deleted",
            sessionId: msg.sessionId,
            sessions: updatedSessions,
          });
        } catch (e) {
          console.error("[next-webui] delete-session error:", e);
          this.sendTo(ws, { type: "error", message: String(e) });
        }
        break;
    }
  }

  private buildInput(
    text: string,
    images: ImageInput[],
  ): string | UserMessagePart[] | null {
    if (!text && images.length === 0) return null;
    if (images.length === 0) return text;

    const parts: UserMessagePart[] = [];
    if (text) parts.push({ type: "text" as const, text });
    for (const img of images) {
      parts.push({ type: "image" as const, mimeType: img.mimeType, data: img.data });
    }
    return parts;
  }
}
