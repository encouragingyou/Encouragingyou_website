import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";

function formatLogs(logs) {
  return logs.join("").trim();
}

export async function startBuiltPreviewServer({
  cwd,
  port,
  host = "127.0.0.1",
  env = {}
}) {
  const baseUrl = `http://${host}:${port}`;
  const logs = [];
  const serverProcess = spawn("node", ["./dist/server/entry.mjs"], {
    cwd,
    env: {
      ...process.env,
      ...env,
      HOST: host,
      PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  serverProcess.stdout.on("data", (chunk) => {
    logs.push(chunk.toString());
  });

  serverProcess.stderr.on("data", (chunk) => {
    logs.push(chunk.toString());
  });

  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (serverProcess.exitCode !== null) {
      throw new Error(
        `Preview server exited early with code ${serverProcess.exitCode}.\n${formatLogs(logs)}`
      );
    }

    try {
      const response = await fetch(baseUrl);

      if (response.ok) {
        return {
          baseUrl,
          logs,
          serverProcess,
          async stop() {
            if (serverProcess.exitCode !== null) {
              return;
            }

            serverProcess.kill("SIGTERM");
            for (let attempt = 0; attempt < 20; attempt += 1) {
              if (serverProcess.exitCode !== null) {
                return;
              }

              await delay(100);
            }

            if (serverProcess.exitCode === null) {
              serverProcess.kill("SIGKILL");
              await once(serverProcess, "exit");
            }
          }
        };
      }
    } catch {
      // Server not ready yet.
    }

    await delay(200);
  }

  serverProcess.kill("SIGTERM");
  throw new Error(`Timed out waiting for the preview server.\n${formatLogs(logs)}`);
}
