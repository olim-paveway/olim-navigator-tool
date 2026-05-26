import { Resend } from "resend";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { DeliveryEmail } from "./templates/delivery";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "navigator@olimpaveway.com",
    to,
    subject: `${firstName}, your personal aliyah plan is ready`,
    html,
    attachments: [
      {
        filename: "Your-Aliyah-Plan-Olim-Paveway.pdf",
        content: pdfBuffer,
      },
    ],
  });
}
