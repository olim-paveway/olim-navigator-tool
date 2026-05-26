import { MailerSend, EmailParams, Sender, Recipient, Attachment } from "mailersend";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { DeliveryEmail } from "./templates/delivery";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

type SendPlanEmailArgs = {
  to: string;
  firstName: string;
  readinessScore: number;
  targetArea: string;
  pdfUrl: string;
  pdfBuffer: Buffer;
};

export async function sendPlanEmail({
  to,
  firstName,
  readinessScore,
  targetArea,
  pdfUrl,
  pdfBuffer,
}: SendPlanEmailArgs): Promise<void> {
  const html = renderToStaticMarkup(
    createElement(DeliveryEmail, { firstName, readinessScore, targetArea, pdfUrl })
  );

  const fromEmail = process.env.MAILERSEND_FROM_EMAIL ?? "navigator@olimpaveway.com";
  const fromName = process.env.MAILERSEND_FROM_NAME ?? "Olim Paveway";

  const emailParams = new EmailParams()
    .setFrom(new Sender(fromEmail, fromName))
    .setTo([new Recipient(to, firstName)])
    .setSubject(`${firstName}, your personal aliyah plan is ready`)
    .setHtml(html)
    .setAttachments([
      new Attachment(
        pdfBuffer.toString("base64"),
        "Your-Aliyah-Plan-Olim-Paveway.pdf",
        "attachment"
      ),
    ]);

  await mailerSend.email.send(emailParams);
}
