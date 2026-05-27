import OpenAI from "openai";
import { aiPlanSchema, type AiPlanSchema } from "@/lib/validations/form";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/prompt";
import type { FormSchema } from "@/lib/validations/form";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateWithOpenAI(
  data: FormSchema
): Promise<AiPlanSchema> {
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(data) },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "generate_aliyah_plan",
          description: "Generate a structured personalised aliyah action plan",
          parameters: {
            type: "object",
            properties: {
              readiness_score: { type: "number", description: "0–100 readiness score" },
              intent_score: { type: "number", description: "0–100 intent score" },
              intent_band: {
                type: "string",
                enum: ["Exploring", "Warming Up", "Committed", "Ready to Launch"],
              },
              personal_snapshot: { type: "string" },
              profile_meaning: { type: "string" },
              assessment: { type: "string" },
              country_notes: { type: "string" },
              location_notes: { type: "string" },
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
              consultation_questions: {
                type: "array",
                items: { type: "string" },
              },
              next_step: { type: "string" },
              disclaimer: { type: "string" },
            },
            required: [
              "readiness_score",
              "intent_score",
              "intent_band",
              "personal_snapshot",
              "profile_meaning",
              "assessment",
              "country_notes",
              "location_notes",
              "action_items",
              "timeline_phases",
              "document_checklist",
              "consultation_questions",
              "next_step",
              "disclaimer",
            ],
          },
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "generate_aliyah_plan" } },
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.type !== "function") {
    throw new Error("No function tool call response from OpenAI");
  }

  return aiPlanSchema.parse(JSON.parse(toolCall.function.arguments));
}
