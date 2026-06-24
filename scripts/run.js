const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const mode = process.argv[2] === "start" ? "start" : "dev";

function getPort() {
  let port = "3000";
  
  // Helper to read and extract PORT
  function readPortFromFile(fileName) {
    const filePath = path.join(process.cwd(), fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      const match = content.match(/^\s*PORT\s*=\s*(.*)?\s*$/m);
      if (match) {
        let val = match[1].trim();
        // strip quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        port = val;
      }
    }
  }

  // Load from .env, then override with .env.local
  readPortFromFile(".env");
  readPortFromFile(".env.local");
  
  return port;
}

const port = getPort();
console.log(`> Running Next.js in ${mode} mode on port ${port} (loaded from environment config)`);

// Run next command
const nextProcess = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", mode, "-p", port],
  { stdio: "inherit", shell: true }
);

nextProcess.on("exit", (code) => {
  process.exit(code || 0);
});
