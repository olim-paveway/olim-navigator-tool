import Anthropic from "@anthropic-ai/sdk";
import { aiPlanSchema, type AiPlanSchema } from "@/lib/validations/form";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";
import type { FormSchema } from "@/lib/validations/form";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function generateWithAnthropic(
  data: FormSchema
): Promise<AiPlanSchema> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    system: buildSystemPrompt(),
    messages: [{ role: "user", content: buildUserPrompt(data) }],
    tools: [
      {
        name: "generate_aliyah_plan",
        description: "Generate a structured aliyah action plan",
        input_schema: {
          type: "object" as const,
          properties: {
            readiness_score: { type: "number" },
            assessment: { type: "string" },
            action_items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  urgency: { type: "string", enum: ["high", "medium", "low"] },
                },
                required: ["title", "description", "urgency"],
              },
            },
            timeline_phases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "string" },
                  duration: { type: "string" },
                  tasks: { type: "array", items: { type: "string" } },
                },
                required: ["phase", "duration", "tasks"],
              },
            },
            document_checklist: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  doc: { type: "string" },
                  country_specific: { type: "boolean" },
                },
                required: ["doc", "country_specific"],
              },
            },
          },
          required: [
            "readiness_score",
            "assessment",
            "action_items",
            "timeline_phases",
            "document_checklist",
          ],
        },
      },
    ],
    tool_choice: { type: "tool" as const, name: "generate_aliyah_plan" },
  });

  const toolUse = response.content.find((c) => c.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("No tool use response from Anthropic");
  }

  return aiPlanSchema.parse(toolUse.input);
}
