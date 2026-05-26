import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import type { AiPlanSchema } from "@/lib/validations/form";
import type { FormSchema } from "@/lib/validations/form";

const COLORS = {
  olive: "#5C6B3A",
  gold: "#B8962E",
  cream: "#F8F4E8",
  darkText: "#1A1A1A",
  mutedText: "#6B7280",
  white: "#FFFFFF",
  highUrgency: "#DC2626",
  medUrgency: "#D97706",
  lowUrgency: "#059669",
};

const styles = StyleSheet.create({
  coverPage: { backgroundColor: COLORS.olive, padding: 48, minHeight: "100%" },
  bodyPage: { backgroundColor: COLORS.white, padding: 48 },
  ctaPage: { backgroundColor: COLORS.cream, padding: 48 },
  coverLogo: {
    fontSize: 11,
    color: COLORS.gold,
    letterSpacing: 2,
    marginBottom: 8,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
  },
  coverSubtitle: { fontSize: 13, color: COLORS.cream, marginBottom: 48 },
  scoreBox: {
    backgroundColor: COLORS.gold,
    borderRadius: 8,
    padding: 24,
    width: 160,
    alignItems: "center",
    marginBottom: 24,
  },
  scoreNumber: { fontSize: 52, fontWeight: "bold", color: COLORS.white },
  scoreLabel: { fontSize: 9, color: COLORS.white, letterSpacing: 1 },
  coverMeta: { fontSize: 10, color: COLORS.cream, marginBottom: 4 },
  coverFooter: { position: "absolute", bottom: 40, left: 48, right: 48 },
  coverFooterText: { fontSize: 8, color: COLORS.cream, opacity: 0.6 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.olive,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
    paddingBottom: 5,
    marginTop: 20,
  },
  paragraph: {
    fontSize: 10,
    color: COLORS.darkText,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  actionItem: {
    marginBottom: 10,
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 4,
  },
  urgencyBadge: {
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    color: COLORS.white,
    marginBottom: 3,
    alignSelf: "flex-start",
  },
  actionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.darkText,
    marginBottom: 2,
  },
  actionDesc: { fontSize: 9, color: COLORS.mutedText, lineHeight: 1.5 },
  timelinePhase: { marginBottom: 14 },
  phaseName: { fontSize: 11, fontWeight: "bold", color: COLORS.olive },
  phaseDuration: { fontSize: 9, color: COLORS.gold, marginBottom: 3 },
  phaseTask: {
    fontSize: 9,
    color: COLORS.darkText,
    marginBottom: 2,
    paddingLeft: 10,
  },
  checkItem: { flexDirection: "row", marginBottom: 4, alignItems: "flex-start" },
  checkbox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: COLORS.olive,
    borderRadius: 2,
    marginRight: 7,
    marginTop: 1,
  },
  checkText: { fontSize: 9, color: COLORS.darkText, flex: 1 },
  countryBadge: { fontSize: 7, color: COLORS.gold, marginLeft: 4 },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.olive,
    marginBottom: 10,
  },
  ctaText: {
    fontSize: 11,
    color: COLORS.darkText,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  ctaBox: {
    backgroundColor: COLORS.olive,
    borderRadius: 6,
    padding: 20,
    marginBottom: 20,
  },
  ctaBoxTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 6,
  },
  ctaBoxText: { fontSize: 9, color: COLORS.cream, lineHeight: 1.7 },
  website: {
    fontSize: 14,
    color: COLORS.gold,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
  },
});

function urgencyColor(urgency: string): string {
  if (urgency === "high") return COLORS.highUrgency;
  if (urgency === "medium") return COLORS.medUrgency;
  return COLORS.lowUrgency;
}

type PdfProps = {
  formData: Pick<
    FormSchema,
    "firstName" | "country" | "targetArea" | "timeline" | "familyType"
  >;
  plan: AiPlanSchema;
};

function AliyahPlanDocument({ formData, plan }: PdfProps) {
  const paragraphs = plan.assessment
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Document
      title={`Aliyah Plan — ${formData.firstName}`}
      author="Olim Paveway"
    >
      {/* Page 1: Cover */}
      <Page size="A4" style={{ padding: 0 }}>
        <View style={styles.coverPage}>
          <Text style={styles.coverLogo}>OLIM PAVEWAY</Text>
          <Text style={styles.coverTitle}>
            {"Your Personal\nAliyah Action Plan"}
          </Text>
          <Text style={styles.coverSubtitle}>
            {`Prepared exclusively for ${formData.firstName} · ${formData.country} → ${formData.targetArea}`}
          </Text>
          <View style={styles.scoreBox}>
            <Text style={styles.scoreNumber}>{plan.readiness_score}</Text>
            <Text style={styles.scoreLabel}>READINESS SCORE</Text>
          </View>
          <Text style={styles.coverMeta}>
            {`Timeline: ${formData.timeline} · ${formData.familyType}`}
          </Text>
          <View style={styles.coverFooter}>
            <Text style={styles.coverFooterText}>
              {`This plan was generated exclusively for ${formData.firstName} based on their unique situation.\n© ${new Date().getFullYear()} Olim Paveway · www.olimpaveway.com · All rights reserved.`}
            </Text>
          </View>
        </View>
      </Page>

      {/* Page 2: Assessment + Action Items */}
      <Page size="A4" style={styles.bodyPage}>
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>
          Your Personal Assessment
        </Text>
        {paragraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>
            {p}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Your 5 Priority Actions</Text>
        {plan.action_items.map((item, i) => (
          <View
            key={i}
            style={[
              styles.actionItem,
              { borderLeftColor: urgencyColor(item.urgency) },
            ]}
          >
            <Text
              style={[
                styles.urgencyBadge,
                { backgroundColor: urgencyColor(item.urgency) },
              ]}
            >
              {item.urgency.toUpperCase()}
            </Text>
            <Text style={styles.actionTitle}>
              {i + 1}. {item.title}
            </Text>
            <Text style={styles.actionDesc}>{item.description}</Text>
          </View>
        ))}
      </Page>

      {/* Page 3: Timeline + Document Checklist */}
      <Page size="A4" style={styles.bodyPage}>
        <Text style={[styles.sectionTitle, { marginTop: 0 }]}>
          Your Aliyah Timeline
        </Text>
        {plan.timeline_phases.map((phase, i) => (
          <View key={i} style={styles.timelinePhase}>
            <Text style={styles.phaseName}>{phase.phase}</Text>
            <Text style={styles.phaseDuration}>{phase.duration}</Text>
            {phase.tasks.map((task, j) => (
              <Text key={j} style={styles.phaseTask}>
                • {task}
              </Text>
            ))}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Document Checklist</Text>
        {plan.document_checklist.map((item, i) => (
          <View key={i} style={styles.checkItem}>
            <View style={styles.checkbox} />
            <Text style={styles.checkText}>
              {item.doc}
              {item.country_specific && (
                <Text style={styles.countryBadge}>
                  {" "}
                  ({formData.country} specific)
                </Text>
              )}
            </Text>
          </View>
        ))}
      </Page>

      {/* Page 4: CTA */}
      <Page size="A4" style={styles.ctaPage}>
        <Text style={styles.ctaTitle}>
          {"Ready to Make Aliyah\nthe Right Way?"}
        </Text>
        <Text style={styles.ctaText}>
          {
            "This plan gives you the roadmap. Olim Paveway gives you the team.\n\nOur olim concierge service handles everything from your NBN application through your first year of integration — so you can focus on your family and your future in Israel, not on paperwork."
          }
        </Text>
        <View style={styles.ctaBox}>
          <Text style={styles.ctaBoxTitle}>
            What Olim Paveway handles for you:
          </Text>
          <Text style={styles.ctaBoxText}>
            {
              "✓ Aliyah application preparation and submission\n✓ Pre-aliyah pilot trip coordination\n✓ Housing search and lease review\n✓ Bank account opening assistance\n✓ School enrollment for children\n✓ Employment and business setup guidance\n✓ 12-month post-arrival support"
            }
          </Text>
        </View>
        <Text style={styles.ctaText}>
          Book a free 30-minute consultation and let us build your aliyah plan
          together.
        </Text>
        <Text style={styles.website}>www.olimpaveway.com</Text>
      </Page>
    </Document>
  );
}

export async function generateAliyahPdf(
  formData: Pick<
    FormSchema,
    "firstName" | "country" | "targetArea" | "timeline" | "familyType"
  >,
  plan: AiPlanSchema
): Promise<Buffer> {
  const doc = <AliyahPlanDocument formData={formData} plan={plan} />;
  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
