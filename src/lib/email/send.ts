import { MailerSend, EmailParams, Sender, Recipient, Attachment } from "mailersend";
import { buildDeliveryEmailHtml } from "./templates/delivery";
import { buildInternalNotificationEmailHtml } from "./templates/internal-notification";
import { buildFollowUpEmailHtml } from "./templates/followup";
import { INTERNAL_LEAD_NOTIFICATION_EMAIL } from "@/lib/config";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

function defaultSender(): Sender {
  const fromEmail = process.env.MAILERSEND_FROM_EMAIL ?? "navigator@olimpaveway.com";
  const fromName = process.env.MAILERSEND_FROM_NAME ?? "Olim Paveway";
  return new Sender(fromEmail, fromName);
}

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
  const html = buildDeliveryEmailHtml({ firstName, readinessScore, targetArea, pdfUrl });

  const emailParams = new EmailParams()
    .setFrom(defaultSender())
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

type SendInternalLeadNotificationArgs = {
  leadId: string;
  firstName: string;
  email: string;
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

export async function sendInternalLeadNotification(
  args: SendInternalLeadNotificationArgs
): Promise<void> {
  const html = buildInternalNotificationEmailHtml(args);

  const emailParams = new EmailParams()
    .setFrom(defaultSender())
    .setTo([new Recipient(INTERNAL_LEAD_NOTIFICATION_EMAIL)])
    .setSubject(`New Navigator registration: ${args.firstName} (${args.country})`)
    .setHtml(html);

  await mailerSend.email.send(emailParams);
}

type SendFollowUpEmailArgs = {
  to: string;
  firstName: string;
};

export async function sendFollowUpEmail({
  to,
  firstName,
}: SendFollowUpEmailArgs): Promise<void> {
  const html = buildFollowUpEmailHtml({ firstName });

  const emailParams = new EmailParams()
    .setFrom(defaultSender())
    .setTo([new Recipient(to, firstName)])
    .setSubject("Olim Paveway is here to help with your aliyah")
    .setHtml(html);

  await mailerSend.email.send(emailParams);
}
