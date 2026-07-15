import { CONSULTATION_URL, MAIN_SITE_DISPLAY } from "@/lib/config";

type FollowUpEmailProps = {
  firstName: string;
};

const SERVICES = [
  "Aliyah application preparation and submission",
  "Pre-aliyah pilot trip coordination",
  "Housing search and lease review",
  "Bank account opening assistance",
  "School enrolment for children",
  "Employment and business setup guidance",
  "12-month post-arrival support",
];

export function buildFollowUpEmailHtml({ firstName }: FollowUpEmailProps): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Georgia,serif;background-color:#F8F4E8;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4E8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#352f6e;padding:32px 40px;">
              <p style="margin:0;font-size:12px;color:#c4bfec;letter-spacing:2px;font-family:Arial,sans-serif;">OLIM PAVEWAY</p>
              <h1 style="margin:8px 0 0;font-size:24px;color:#ffffff;font-weight:bold;">We're Here to Help</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0;font-size:16px;color:#1A1A1A;">Hi ${firstName},</p>
              <p style="margin:12px 0 0;font-size:14px;color:#6B7280;line-height:1.6;">
                A few days ago you received your personalised aliyah plan from the Navigator.
                We wanted to follow up — turning that plan into action is exactly what Olim
                Paveway does, and we&apos;d love to help you get there.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 40px 0;">
              <p style="font-size:14px;color:#1A1A1A;line-height:1.6;margin:0 0 12px;font-weight:bold;">
                What Olim Paveway handles for you:
              </p>
              <ul style="font-size:14px;color:#1A1A1A;line-height:2;padding-left:20px;margin:0;">
                ${SERVICES.map((s) => `<li>${s}</li>`).join("\n                ")}
              </ul>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:28px 40px 32px;">
              <a href="${CONSULTATION_URL}"
                 style="display:inline-block;background-color:#352f6e;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;font-family:Arial,sans-serif;">
                Book Your Free Consultation
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F8F4E8;padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;font-family:Arial,sans-serif;">
                &copy; ${year} Olim Paveway &middot; ${MAIN_SITE_DISPLAY}<br>
                You received this because you requested an aliyah plan.
                To unsubscribe, reply with &ldquo;unsubscribe&rdquo;.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
