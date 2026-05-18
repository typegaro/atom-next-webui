import { definePlugin } from "@typegaro/atom-plugin";
import type { PluginRuntimeContext } from "@typegaro/atom-plugin";
import { exec } from "child_process";
import { resolve } from "node:path";
import { NextWebUIServer } from "./server";

const DEFAULT_PORT = 3131;

export default definePlugin({
  id: "atom-next-webui",
  capabilities: ["config", "models", "runs", "sessions"],
  cliCommands: [
    {
      register(program, host) {
        program
          .command("next-webui")
          .description("Launch the Atom Next Web UI")
          .option("-p, --port <port>", "Port to listen on", String(DEFAULT_PORT))
          .action(async (opts: { port: string }) => {
            const port = parseInt(opts.port, 10);
            await runWebUIChannel(
              host as unknown as PluginRuntimeContext<"models" | "sessions">,
              port,
            );
          });
      },
    },
  ],
  channels: [
    {
      id: "atom-next-webui",
      start(host) {
        return runWebUIChannel(
          host as unknown as PluginRuntimeContext<"models" | "sessions">,
          DEFAULT_PORT,
        );
      },
    },
  ],
});

async function runWebUIChannel(
  context: PluginRuntimeContext<"models" | "sessions">,
  port: number,
): Promise<void> {
  const session = context.runtime.openSession({
    key: "atom-next-webui",
    storeSession: true,
  });
  const sessionsDir = resolve(context.config.getPaths().configDir, "sessions");
  const server = new NextWebUIServer(session, sessionsDir);
  await server.start(port);

  const url = `http://localhost:${port}`;
  console.log(`\nAtom Next WebUI ready: ${url}`);

  // Show LAN IP for phone/network access
  const { networkInterfaces } = await import("node:os");
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        console.log(`  Network access: http://${net.address}:${port}`);
      }
    }
  }
  console.log("");

  openBrowser(url);

  await new Promise<void>(() => {});
}

function openBrowser(url: string): void {
  const cmd =
    process.platform === "darwin"
      ? `open "${url}"`
      : process.platform === "win32"
        ? `start "" "${url}"`
        : `xdg-open "${url}"`;

  exec(cmd, (err) => {
    if (err) console.error("Could not open browser:", err.message);
  });
}
