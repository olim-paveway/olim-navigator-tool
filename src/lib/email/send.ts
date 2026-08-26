import { Resend } from "resend";
import { buildDeliveryEmailHtml } from "./templates/delivery";
import { buildInternalNotificationEmailHtml } from "./templates/internal-notification";
import { buildFollowUpEmailHtml } from "./templates/followup";
import { INTERNAL_LEAD_NOTIFICATION_EMAILS } from "@/lib/config";

// Lazy singleton — the Resend constructor throws when the API key is
// missing/empty, which would otherwise crash Next.js's build-time route
// analysis (routes are imported without runtime env vars during `next build`).
let resendClient: Resend | undefined;
function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function defaultFrom(): string {
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "navigator@olimpaveway.com";
  const fromName = process.env.RESEND_FROM_NAME ?? "Olim Paveway";
  return `${fromName} <${fromEmail}>`;
}

// Resend returns { data, error } instead of throwing — normalize to a thrown
// Error so callers can keep using try/catch like the rest of the pipeline.
function assertSent(error: { message: string; statusCode: number | null; name: string } | null): void {
  if (error) {
    throw new Error(`Resend ${error.name} (HTTP ${error.statusCode}): ${error.message}`);
  }
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

  const { error } = await getResend().emails.send({
    from: defaultFrom(),
    to,
    // Every plan report also goes to the internal team, blind so the
    // recipient's copy doesn't show them in the header.
    bcc: INTERNAL_LEAD_NOTIFICATION_EMAILS,
    subject: `${firstName}, your personal aliyah plan is ready`,
    html,
    attachments: [
      {
        filename: "Your-Aliyah-Plan-Olim-Paveway.pdf",
        content: pdfBuffer,
      },
    ],
  });

  assertSent(error);
}

type SendInternalLeadNotificationArgs = {
  leadId: string;
  firstName: string;
  email: string;
  phone: string | null;
  country: string;
  state: string | null;
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

  const { error } = await getResend().emails.send({
    from: defaultFrom(),
    to: INTERNAL_LEAD_NOTIFICATION_EMAILS,
    subject: `New Navigator registration: ${args.firstName} (${args.country})`,
    html,
  });

  assertSent(error);
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

  const { error } = await getResend().emails.send({
    from: defaultFrom(),
    to,
    subject: "Olim Paveway is here to help with your aliyah",
    html,
  });

  assertSent(error);
}
