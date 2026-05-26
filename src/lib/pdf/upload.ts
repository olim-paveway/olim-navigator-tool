import { put } from "@vercel/blob";

export async function uploadPdfToBlob(
  pdfBuffer: Buffer,
  leadId: string
): Promise<string> {
  const filename = `aliyah-plans/${leadId}.pdf`;
  const blob = await put(filename, pdfBuffer, {
    access: "public",
    contentType: "application/pdf",
  });
  return blob.url;
}
