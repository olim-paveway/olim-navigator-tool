import { SITE_URL } from "@/lib/config";

type InternalNotificationProps = {
  leadId: string;
  firstName: string;
  email: string;
  phone: string | null;
  country: string;
  targetArea: string;
  timeline: string;
  familyType: string;
  career: string;
  spouseCareer: string;
  concerns: string[];
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 16px 6px 0;color:#6B7280;font-size:13px;vertical-align:top;white-space:nowrap;">${label}</td>
    <td style="padding:6px 0;color:#1A1A1A;font-size:13px;">${value}</td>
  </tr>`;
}

export function buildInternalNotificationEmailHtml({
  leadId,
  firstName,
  email,
  phone,
  country,
  targetArea,
  timeline,
  familyType,
  career,
  spouseCareer,
  concerns,
  utmSource,
  utmMedium,
  utmCampaign,
}: InternalNotificationProps): string {
  const utm = [utmSource, utmMedium, utmCampaign].filter(Boolean).join(" / ") || "—";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:Arial,sans-serif;background-color:#F8F4E8;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F4E8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
          <tr>
            <td style="background-color:#352f6e;padding:24px 32px;">
              <p style="margin:0;font-size:12px;color:#c4bfec;letter-spacing:2px;">OLIM PAVEWAY NAVIGATOR</p>
              <h1 style="margin:8px 0 0;font-size:20px;color:#ffffff;font-weight:bold;">New Registration: ${firstName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                ${row("Name", firstName)}
                ${row("Email", `<a href="mailto:${email}" style="color:#352f6e;">${email}</a>`)}
                ${row("Phone", phone ? `<a href="tel:${phone}" style="color:#352f6e;">${phone}</a>` : "—")}
                ${row("Country", country)}
                ${row("Target area", targetArea)}
                ${row("Timeline", timeline)}
                ${row("Family type", familyType)}
                ${row("Career", career)}
                ${row("Spouse career", spouseCareer)}
                ${row("Concerns", concerns.join(", ") || "—")}
                ${row("UTM", utm)}
                ${row("Lead ID", leadId)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;">
              <a href="${SITE_URL}/admin"
                 style="display:inline-block;background-color:#352f6e;color:#ffffff;padding:10px 22px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold;">
                View in Admin
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
