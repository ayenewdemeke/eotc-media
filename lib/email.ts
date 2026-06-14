import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT ?? "465"),
  secure: (process.env.SMTP_PORT ?? "465") === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

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
  const amLines = bodyAm.split("\n").map(l => `<p style="margin:0 0 10px">${l || "&nbsp;"}</p>`).join("")
  const enLines = bodyEn.split("\n").map(l => `<p style="margin:0 0 10px">${l || "&nbsp;"}</p>`).join("")

  return `<!DOCTYPE html>
<html lang="am">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
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
          <div style="font-size:15px;color:#374151;line-height:1.8" dir="auto">${amLines}</div>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 32px"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0"></td></tr>

        <!-- English section -->
        <tr><td style="padding:24px 32px 32px">
          <p style="margin:0 0 6px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#6b7280">English</p>
          <h2 style="margin:0 0 16px;font-size:18px;color:#111827;line-height:1.4">${subjectEn}</h2>
          <div style="font-size:15px;color:#374151;line-height:1.8">${enLines}</div>
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
