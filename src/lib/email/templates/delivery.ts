type DeliveryEmailProps = {
  firstName: string;
  readinessScore: number;
  targetArea: string;
  pdfUrl: string;
};

export function buildDeliveryEmailHtml({
  firstName,
  readinessScore,
  targetArea,
  pdfUrl,
}: DeliveryEmailProps): string {
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
              <h1 style="margin:8px 0 0;font-size:24px;color:#ffffff;font-weight:bold;">Your Aliyah Plan is Ready</h1>
            </td>
          </tr>

          <!-- Score + greeting -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#221c52;border-radius:8px;padding:20px 32px;text-align:center;vertical-align:middle;">
                    <p style="margin:0;font-size:48px;font-weight:bold;color:#ffffff;line-height:1;">${readinessScore}</p>
                    <p style="margin:4px 0 0;font-size:10px;color:#ffffff;letter-spacing:1px;font-family:Arial,sans-serif;">READINESS SCORE</p>
                  </td>
                  <td style="padding-left:24px;vertical-align:middle;">
                    <p style="margin:0;font-size:16px;color:#1A1A1A;">Hi ${firstName},</p>
                    <p style="margin:8px 0 0;font-size:14px;color:#6B7280;line-height:1.6;">
                      Your personalised aliyah action plan for ${targetArea} is attached to this email.
                      It was created specifically for your situation.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="font-size:14px;color:#1A1A1A;line-height:1.6;margin:0 0 12px;">Your plan includes:</p>
              <ul style="font-size:14px;color:#1A1A1A;line-height:2;padding-left:20px;margin:0 0 16px;">
                <li>Your personal readiness assessment</li>
                <li>5 priority action items ranked by urgency</li>
                <li>A phased aliyah timeline for your situation</li>
                <li>A document checklist specific to your country of origin</li>
              </ul>
              <p style="font-size:14px;color:#1A1A1A;line-height:1.6;margin:0;">
                The PDF is attached below. You can also
                <a href="${pdfUrl}" style="color:#352f6e;">view it online</a>.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;">
              <a href="https://www.olimpaveway.com/consultation"
                 style="display:inline-block;background-color:#352f6e;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:bold;font-family:Arial,sans-serif;">
                Book Your Free Consultation
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F8F4E8;padding:24px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;font-family:Arial,sans-serif;">
                &copy; ${year} Olim Paveway &middot; www.olimpaveway.com<br>
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
