// ── Brevo (transactional) sender ──────────────────────────────────────────────
// One API call sends personalized emails to up to ~1000 recipients using
// "message versions" — so a 600-person newsletter goes out in a single fast
// request (no per-recipient loop, no serverless timeout). Each recipient still
// gets their own unsubscribe link via Brevo params ({{params.unsubscribeUrl}}).
//
// Env: BREVO_API_KEY, BREVO_SENDER_EMAIL (a verified Brevo sender), BREVO_SENDER_NAME.

const BREVO_BATCH = 500 // message versions per API call

function getSender(): { email: string; name: string } {
  const email = process.env.BREVO_SENDER_EMAIL ?? ""
  const name = process.env.BREVO_SENDER_NAME ?? "EOTC Media"
  return { email, name }
}

export interface CampaignRecipient {
  email: string
  name?: string | null
  unsubscribeUrl: string
}

/**
 * Send one bilingual HTML email to many recipients via Brevo.
 * `htmlContent` must contain the literal placeholder {{params.unsubscribeUrl}}
 * where the per-recipient unsubscribe link should go.
 */
export async function sendCampaign(opts: {
  subject: string
  htmlContent: string
  recipients: CampaignRecipient[]
}): Promise<{ sent: number; failed: number; error: string | null }> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return { sent: 0, failed: opts.recipients.length, error: "BREVO_API_KEY is not configured." }
  }
  const sender = getSender()
  if (!sender.email) {
    return { sent: 0, failed: opts.recipients.length, error: "BREVO_SENDER_EMAIL is not configured." }
  }

  const recipients = opts.recipients.filter(r => r.email)
  let sent = 0
  let failed = 0
  let firstError: string | null = null

  for (let i = 0; i < recipients.length; i += BREVO_BATCH) {
    const chunk = recipients.slice(i, i + BREVO_BATCH)
    const messageVersions = chunk.map(r => ({
      to: [{ email: r.email, ...(r.name ? { name: r.name } : {}) }],
      params: { unsubscribeUrl: r.unsubscribeUrl },
    }))

    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender,
          subject: opts.subject,
          htmlContent: opts.htmlContent,
          messageVersions,
        }),
      })
      if (res.ok) {
        sent += chunk.length
      } else {
        failed += chunk.length
        const detail = await res.text().catch(() => "")
        if (!firstError) firstError = `Brevo ${res.status}: ${detail.slice(0, 300)}`
      }
    } catch (err) {
      failed += chunk.length
      if (!firstError) firstError = err instanceof Error ? err.message : String(err)
    }
  }

  return { sent, failed, error: firstError }
}

export function buildEmailHtml({
  subjectAm,
  subjectEn,
  bodyAm,
  bodyEn,
  unsubscribeUrl,
}: {
  subjectAm: string
  subjectEn: string
  bodyAm: string
  bodyEn: string
  unsubscribeUrl: string
}): string {
  const bodyStyles = `<style>
    .bc p{margin:0 0 10px}.bc ul{margin:0 0 10px;padding-left:20px;list-style:disc}
    .bc ol{margin:0 0 10px;padding-left:20px;list-style:decimal}.bc li{margin:0 0 4px}
    .bc strong{font-weight:700}.bc em{font-style:italic}.bc u{text-decoration:underline}
    .bc s{text-decoration:line-through}.bc a{color:#1a3a5c}
  </style>`

  return `<!DOCTYPE html>
<html lang="am">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${bodyStyles}</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr><td style="background:#1a3a5c;padding:28px 32px;text-align:center">
          <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;letter-spacing:0.5px">EOTC Media</p>
          <p style="margin:6px 0 0;font-size:13px;color:#93c5fd">Ethiopian Orthodox Tewahedo Church</p>
        </td></tr>

        <!-- Amharic section -->
        <tr><td style="padding:32px 32px 24px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#6b7280">አማርኛ</p>
          <h2 style="margin:0 0 16px;font-size:18px;color:#111827;line-height:1.4" dir="auto">${subjectAm}</h2>
          <div class="bc" style="font-size:15px;color:#374151;line-height:1.8" dir="auto">${bodyAm}</div>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 32px"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0"></td></tr>

        <!-- English section -->
        <tr><td style="padding:24px 32px 32px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#6b7280">English</p>
          <h2 style="margin:0 0 16px;font-size:18px;color:#111827;line-height:1.4">${subjectEn}</h2>
          <div class="bc" style="font-size:15px;color:#374151;line-height:1.8">${bodyEn}</div>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:0 32px 32px;text-align:center">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://eotcmedia.com"}"
             style="display:inline-block;padding:12px 28px;background:#1a3a5c;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">
            Visit EOTC Media
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            You are receiving this because you are a member of EOTC Media.<br>
            <a href="${unsubscribeUrl}" style="color:#6b7280;text-decoration:underline">Unsubscribe</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
