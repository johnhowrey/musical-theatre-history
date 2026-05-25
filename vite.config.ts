import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { execFile } from "node:child_process";
import { appendFileSync } from "node:fs";
import { flagTitle, flagBody } from "./api/flag";

// Dev-only endpoint mirroring the Vercel /api/flag function: creates a GitHub
// issue via the locally-authed `gh` CLI (no token in code) + logs to flags.jsonl.
function flagDevPlugin(): Plugin {
  return {
    name: "flag-dev-endpoint",
    configureServer(server) {
      server.middlewares.use("/api/flag", (req, res) => {
        if (req.method !== "POST") { res.statusCode = 405; res.end("POST only"); return; }
        let raw = "";
        req.on("data", (c) => (raw += c));
        req.on("end", () => {
          let p: any = {};
          try { p = JSON.parse(raw || "{}"); } catch { /* ignore */ }
          const json = (code: number, body: any) => { res.statusCode = code; res.setHeader("content-type", "application/json"); res.end(JSON.stringify(body)); };
          if (!p.note || !String(p.note).trim()) return json(400, { error: "note required" });
          try { appendFileSync("reports/flags.jsonl", JSON.stringify({ ...p, ts: new Date().toISOString() }) + "\n"); } catch { /* ignore */ }
          execFile("gh", ["issue", "create", "--repo", "johnhowrey/musical-theatre-history", "--title", flagTitle(p), "--body", flagBody(p), "--label", "map-flag"],
            (err, stdout) => {
              if (err) return json(200, { ok: true, logged: true, url: null, note: "logged to flags.jsonl (gh: " + err.message.slice(0, 80) + ")" });
              json(200, { ok: true, url: stdout.trim() });
            });
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), flagDevPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.svg"],
});
