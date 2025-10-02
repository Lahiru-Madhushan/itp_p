import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_BIN = process.env.PYTHON_BIN || "python";
const FALLBACK_HELPER = path.resolve(__dirname, "../../python/helper.py");
const PY_HELPER = process.env.PY_HELPER_ABS_PATH || FALLBACK_HELPER;

export const predictWithPython = (text) => {
  return new Promise((resolve, reject) => {
    const args = [PY_HELPER, text];
    const proc = spawn(PYTHON_BIN, args, { shell: process.platform === "win32" });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => (stderr += d.toString()));

    proc.on("close", (code) => {
      if (code !== 0 && stderr) {
        return reject(new Error(stderr.trim()));
      }
      // Take only the last non-empty line (should be 'positive' or 'negative')
      const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
      const out = lines[lines.length - 1];
      if (out !== "positive" && out !== "negative") {
        return reject(new Error(`Unexpected output: ${out}`));
      }
      resolve(out);
    });

    proc.on("error", (err) => reject(err));
  });
};
