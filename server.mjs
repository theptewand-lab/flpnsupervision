import { createServer } from "node:http";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const port = Number(process.env.PORT || 4173);
const recordsRoot = join(root, "data", "supervision-records");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function json(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 80 * 1024 * 1024) {
        request.destroy();
        reject(new Error("Payload too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function cleanName(value) {
  return String(value || "record")
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

function assertInsideRoot(pathname) {
  const filePath = normalize(join(root, pathname));
  if (!filePath.startsWith(root)) {
    throw new Error("Forbidden");
  }
  return filePath;
}

async function listRecords() {
  await mkdir(recordsRoot, { recursive: true });
  const entries = await readdir(recordsRoot, { withFileTypes: true });
  const records = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try {
      const reportPath = join(recordsRoot, entry.name, "report.json");
      const record = JSON.parse(await readFile(reportPath, "utf8"));
      records.push(record);
    } catch {
      // Skip partial or manually edited folders.
    }
  }

  return records.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function saveRecord(payload) {
  const record = payload.record || {};
  const images = payload.images || [];
  const id = cleanName(record.id || `PN-${Date.now()}`);
  const teacherName = cleanName(record.general?.teacherName || "unknown-teacher");
  const dateText = cleanName(record.general?.supervisionDate || new Date().toISOString().slice(0, 10));
  const folderName = `${dateText}_${teacherName}_${id}`;
  const recordFolder = join(recordsRoot, folderName);
  const imageFolder = join(recordFolder, "images");

  await mkdir(imageFolder, { recursive: true });

  const savedImages = [];
  for (const [index, image] of images.entries()) {
    if (!image.base64) continue;
    const filename = `${String(index + 1).padStart(2, "0")}_${cleanName(image.name || "evidence.jpg").replace(/\.[^.]+$/, "")}.jpg`;
    const imagePath = join(imageFolder, filename);
    await writeFile(imagePath, Buffer.from(image.base64, "base64"));
    savedImages.push({
      name: image.name || filename,
      type: "image/jpeg",
      size: image.size || 0,
      localUrl: `/data/supervision-records/${encodeURIComponent(folderName)}/images/${encodeURIComponent(filename)}`
    });
  }

  const savedRecord = {
    ...record,
    images: savedImages,
    storage: {
      saved: true,
      provider: "codex-server",
      folderPath: recordFolder,
      reportPath: join(recordFolder, "report.json")
    }
  };

  await writeFile(join(recordFolder, "report.json"), JSON.stringify(savedRecord, null, 2));
  return savedRecord;
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    if (url.pathname === "/api/supervision-records" && request.method === "GET") {
      json(response, 200, { ok: true, records: await listRecords() });
      return;
    }

    if (url.pathname === "/api/supervision-records" && request.method === "POST") {
      const payload = JSON.parse(await readBody(request));
      json(response, 200, { ok: true, record: await saveRecord(payload) });
      return;
    }

    if (url.pathname === "/api/supervision-records" && request.method === "DELETE") {
      await rm(recordsRoot, { recursive: true, force: true });
      await mkdir(recordsRoot, { recursive: true });
      json(response, 200, { ok: true });
      return;
    }

    const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const filePath = assertInsideRoot(pathname);

    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream"
    });
    response.end(body);
  } catch (error) {
    if (request.url?.startsWith("/api/")) {
      json(response, 500, { ok: false, message: error.message || "Server error" });
    } else {
      response.writeHead(error.message === "Forbidden" ? 403 : 404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(error.message === "Forbidden" ? "Forbidden" : "Not found");
    }
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});
