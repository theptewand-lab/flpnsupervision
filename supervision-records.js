const STORE_NAME = "supervision-records";
const RECORD_PREFIX = "records/";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(data, statusCode = 200) {
  return {
    statusCode,
    headers: jsonHeaders,
    body: JSON.stringify(data)
  };
}

function cleanName(value) {
  return String(value || "record")
    .replace(/[\\/:*?"<>|#%{}~&]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

function imageKey(recordKey, index, image) {
  const baseName = cleanName(image.name || "evidence.jpg").replace(/\.[^.]+$/, "");
  return `${recordKey}/images/${String(index + 1).padStart(2, "0")}_${baseName}.jpg`;
}

function getRequestUrl(event) {
  if (event.rawUrl) return new URL(event.rawUrl);
  const protocol = event.headers["x-forwarded-proto"] || "https";
  const host = event.headers.host || "localhost";
  const query = event.rawQuery ? `?${event.rawQuery}` : "";
  return new URL(`${protocol}://${host}${event.path}${query}`);
}

async function listRecords(store) {
  const { blobs } = await store.list({ prefix: RECORD_PREFIX });
  const reportKeys = blobs
    .map((blob) => blob.key)
    .filter((key) => key.endsWith("/report.json"));

  const records = await Promise.all(
    reportKeys.map(async (key) => {
      try {
        return await store.get(key, { type: "json" });
      } catch {
        return null;
      }
    })
  );

  return records
    .filter(Boolean)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

async function saveRecord(store, payload, url) {
  const record = payload.record || {};
  const images = payload.images || [];
  const id = cleanName(record.id || `PN-${Date.now()}`);
  const teacherName = cleanName(record.general?.teacherName || "unknown-teacher");
  const dateText = cleanName(record.general?.supervisionDate || new Date().toISOString().slice(0, 10));
  const recordKey = `${RECORD_PREFIX}${dateText}_${teacherName}_${id}`;

  const savedImages = [];
  for (const [index, image] of images.entries()) {
    if (!image.base64) continue;
    const key = imageKey(recordKey, index, image);
    const bytes = Buffer.from(image.base64, "base64");
    await store.set(key, bytes, {
      metadata: {
        name: image.name || `evidence-${index + 1}.jpg`,
        type: "image/jpeg",
        recordId: id
      }
    });
    savedImages.push({
      name: image.name || `evidence-${index + 1}.jpg`,
      type: "image/jpeg",
      size: image.size || bytes.byteLength,
      localUrl: `${url.pathname}?asset=${encodeURIComponent(key)}`
    });
  }

  const savedRecord = {
    ...record,
    images: savedImages,
    storage: {
      saved: true,
      provider: "netlify-blobs",
      recordKey,
      reportKey: `${recordKey}/report.json`
    }
  };

  await store.setJSON(`${recordKey}/report.json`, savedRecord, {
    metadata: {
      recordId: id,
      teacherName: record.general?.teacherName || "",
      supervisionDate: record.general?.supervisionDate || ""
    }
  });

  return savedRecord;
}

async function getAsset(store, key) {
  const entry = await store.get(key, { type: "arrayBuffer" });
  if (entry === null) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "Not found"
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=300"
    },
    body: Buffer.from(entry).toString("base64"),
    isBase64Encoded: true
  };
}

async function deleteAll(store, event) {
  const adminToken = process.env.SUPERVISION_ADMIN_TOKEN;
  const requestToken = event.headers["x-admin-token"];

  if (!adminToken || requestToken !== adminToken) {
    return json({ ok: false, message: "ต้องตั้งค่าและส่ง SUPERVISION_ADMIN_TOKEN ก่อนล้างข้อมูลออนไลน์" }, 401);
  }

  await store.deleteAll();
  return json({ ok: true });
}

exports.handler = async (event) => {
  try {
    const { connectLambda, getStore } = await import("@netlify/blobs");
    connectLambda(event);
    const store = getStore(STORE_NAME);
    const url = getRequestUrl(event);

    if (event.httpMethod === "GET" && url.searchParams.has("asset")) {
      return getAsset(store, url.searchParams.get("asset"));
    }

    if (event.httpMethod === "GET") {
      return json({ ok: true, records: await listRecords(store) });
    }

    if (event.httpMethod === "POST") {
      const payload = JSON.parse(event.body || "{}");
      return json({ ok: true, record: await saveRecord(store, payload, url) });
    }

    if (event.httpMethod === "DELETE") {
      return deleteAll(store, event);
    }

    return json({ ok: false, message: "Method not allowed" }, 405);
  } catch (error) {
    return json({ ok: false, message: error.message || "Server error" }, 500);
  }
};
