import { AwsClient } from "aws4fetch"

// ── Cloudflare R2 object storage (S3-compatible) ──────────────────────────────
// Files (book PDFs/covers, liturgy audio, profile pictures) live in R2 instead
// of the local filesystem, since serverless hosts have a read-only disk. We use
// aws4fetch (a tiny request signer) rather than the full AWS SDK to keep cold
// starts fast.
//
// Required env vars:
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucket = process.env.R2_BUCKET_NAME

const endpoint = accountId ? `https://${accountId}.r2.cloudflarestorage.com` : ""

let client: AwsClient | null = null

function getClient(): AwsClient {
  if (!accessKeyId || !secretAccessKey || !accountId || !bucket) {
    throw new Error("R2 storage is not configured (missing R2_* environment variables)")
  }
  if (!client) {
    client = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" })
  }
  return client
}

function objectUrl(key: string): string {
  // Preserve "/" in keys (folder-style prefixes) but encode each segment.
  const safeKey = key.split("/").map(encodeURIComponent).join("/")
  return `${endpoint}/${bucket}/${safeKey}`
}

export async function putObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  const res = await getClient().fetch(objectUrl(key), {
    method: "PUT",
    // Node Buffer/Uint8Array are valid request bodies at runtime; cast past the
    // DOM BodyInit typing mismatch.
    body: body as unknown as BodyInit,
    headers: { "Content-Type": contentType },
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`R2 put failed (${res.status}): ${detail}`)
  }
}

export interface StoredObject {
  body: ArrayBuffer
  contentType: string
  contentLength: number
}

/** Fetch an object. Returns null if it does not exist (404). */
export async function getObject(key: string): Promise<StoredObject | null> {
  const res = await getClient().fetch(objectUrl(key), { method: "GET" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`R2 get failed (${res.status})`)
  const buf = await res.arrayBuffer()
  return {
    body: buf,
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
    contentLength: buf.byteLength,
  }
}

/** Delete an object. Succeeds silently if it does not exist. */
export async function deleteObject(key: string): Promise<void> {
  const res = await getClient().fetch(objectUrl(key), { method: "DELETE" })
  if (!res.ok && res.status !== 404) {
    throw new Error(`R2 delete failed (${res.status})`)
  }
}
