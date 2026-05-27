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

const C = {
  blue: "#2596be",
  blueLight: "#5ab0cf",
  blueDark: "#1a78a0",
  blueBg: "#EBF7FC",
  gold: "#B8962E",
  cream: "#F8F4E8",
  darkText: "#1A1A1A",
  mutedText: "#6B7280",
  white: "#FFFFFF",
  highUrgency: "#DC2626",
  medUrgency: "#D97706",
  lowUrgency: "#059669",
  border: "#E5E7EB",
};

const styles = StyleSheet.create({
  // Pages
  coverPage: { backgroundColor: C.blueDark, padding: 48, minHeight: "100%" },
  bodyPage: { backgroundColor: C.white, padding: 44 },
  ctaPage: { backgroundColor: C.blueBg, padding: 44 },

  // Cover
  coverBrand: { fontSize: 10, color: C.blueLight, letterSpacing: 2, marginBottom: 6 },
  coverTitle: { fontSize: 26, fontWeight: "bold", color: C.white, marginBottom: 6 },
  coverSubtitle: { fontSize: 12, color: C.blueLight, marginBottom: 36 },
  coverBandBadge: {
    alignSelf: "flex-start",
    backgroundColor: C.gold,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 20,
  },
  coverBandText: { fontSize: 9, color: C.white, fontWeight: "bold", letterSpacing: 1 },
  scoreRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 24 },
  scoreBox: {
    backgroundColor: C.blue,
    borderRadius: 8,
    padding: 20,
    width: 130,
    alignItems: "center",
    marginRight: 20,
  },
  scoreNumber: { fontSize: 44, fontWeight: "bold", color: C.white, lineHeight: 1 },
  scoreLabel: { fontSize: 8, color: C.white, letterSpacing: 1, marginTop: 4 },
  intentBox: {
    flex: 1,
    backgroundColor: C.blueDark,
    borderWidth: 1,
    borderColor: C.blue,
    borderRadius: 8,
    padding: 16,
  },
  intentLabel: { fontSize: 8, color: C.blueLight, letterSpacing: 1, marginBottom: 4 },
  intentNumber: { fontSize: 32, fontWeight: "bold", color: C.white },
  intentBand: { fontSize: 10, color: C.gold, marginTop: 4 },
  coverSnapshotTitle: { fontSize: 9, color: C.blueLight, letterSpacing: 1, marginBottom: 4 },
  coverSnapshot: { fontSize: 10, color: C.white, lineHeight: 1.6 },
  coverMeta: { fontSize: 9, color: C.blueLight, marginTop: 20, marginBottom: 2 },
  coverFooter: { position: "absolute", bottom: 36, left: 48, right: 48 },
  coverFooterText: { fontSize: 8, color: C.blueLight, opacity: 0.7 },

  // Body sections
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: C.blue,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: C.blue,
    paddingBottom: 5,
    marginTop: 18,
  },
  sectionTitleFirst: {
    fontSize: 14,
    fontWeight: "bold",
    color: C.blue,
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: C.blue,
    paddingBottom: 5,
    marginTop: 0,
  },
  paragraph: {
    fontSize: 10,
    color: C.darkText,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: C.blueBg,
    borderLeftWidth: 3,
    borderLeftColor: C.blue,
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  infoBoxLabel: { fontSize: 8, color: C.blue, letterSpacing: 1, marginBottom: 4 },
  infoBoxText: { fontSize: 10, color: C.darkText, lineHeight: 1.6 },

  // Action items
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
    color: C.white,
    marginBottom: 3,
    alignSelf: "flex-start",
  },
  actionTitle: { fontSize: 10, fontWeight: "bold", color: C.darkText, marginBottom: 2 },
  actionDesc: { fontSize: 9, color: C.mutedText, lineHeight: 1.5 },

  // Timeline
  timelinePhase: { marginBottom: 14 },
  phaseName: { fontSize: 11, fontWeight: "bold", color: C.blue },
  phaseDuration: { fontSize: 9, color: C.gold, marginBottom: 3 },
  phaseTask: { fontSize: 9, color: C.darkText, marginBottom: 2, paddingLeft: 10 },

  // Checklist
  checkItem: { flexDirection: "row", marginBottom: 4, alignItems: "flex-start" },
  checkbox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: C.blue,
    borderRadius: 2,
    marginRight: 7,
    marginTop: 1,
  },
  checkText: { fontSize: 9, color: C.darkText, flex: 1 },
  countryBadge: { fontSize: 7, color: C.gold, marginLeft: 4 },

  // Consultation questions
  questionRow: { flexDirection: "row", marginBottom: 8, alignItems: "flex-start" },
  questionNum: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.blue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 1,
  },
  questionNumText: { fontSize: 9, color: C.white, fontWeight: "bold" },
  questionText: { fontSize: 10, color: C.darkText, lineHeight: 1.5, flex: 1 },

  // Next step
  nextStepBox: {
    backgroundColor: C.blue,
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
  },
  nextStepLabel: { fontSize: 9, color: C.white, letterSpacing: 1, marginBottom: 6, opacity: 0.8 },
  nextStepText: { fontSize: 11, color: C.white, fontWeight: "bold", lineHeight: 1.6 },

  // CTA
  ctaTitle: { fontSize: 18, fontWeight: "bold", color: C.blueDark, marginBottom: 8 },
  ctaText: { fontSize: 10, color: C.darkText, lineHeight: 1.6, marginBottom: 16 },
  ctaBox: { backgroundColor: C.blue, borderRadius: 6, padding: 18, marginBottom: 16 },
  ctaBoxTitle: { fontSize: 11, fontWeight: "bold", color: C.white, marginBottom: 6 },
  ctaBoxText: { fontSize: 9, color: C.white, lineHeight: 1.8, opacity: 0.95 },
  website: { fontSize: 13, color: C.blue, fontWeight: "bold", textAlign: "center", marginTop: 6 },

  // Disclaimer
  disclaimerBox: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 12,
    marginTop: 16,
  },
  disclaimerText: { fontSize: 7, color: C.mutedText, lineHeight: 1.6 },
});

function urgencyColor(u: string): string {
  if (u === "high") return C.highUrgency;
  if (u === "medium") return C.medUrgency;
  return C.lowUrgency;
}

type PdfProps = {
  formData: Pick<FormSchema, "firstName" | "country" | "targetArea" | "timeline" | "familyType">;
  plan: AiPlanSchema;
};

function AliyahPlanDocument({ formData, plan }: PdfProps) {
  const assessmentParagraphs = plan.assessment
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <Document title={`Aliyah Plan — ${formData.firstName}`} author="Olim Paveway">

      {/* ─── Page 1: Cover ─────────────────────────────── */}
      <Page size="A4" style={{ padding: 0 }}>
        <View style={styles.coverPage}>
          <Text style={styles.coverBrand}>OLIM PAVEWAY</Text>
          <Text style={styles.coverTitle}>Your Personal{"\n"}Aliyah Action Plan</Text>
          <Text style={styles.coverSubtitle}>
            {`Prepared exclusively for ${formData.firstName} · ${formData.country} → ${formData.targetArea}`}
          </Text>

          {/* Intent band badge */}
          <View style={styles.coverBandBadge}>
            <Text style={styles.coverBandText}>{plan.intent_band.toUpperCase()}</Text>
          </View>

          {/* Score row */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNumber}>{plan.readiness_score}</Text>
              <Text style={styles.scoreLabel}>READINESS{"\n"}SCORE</Text>
            </View>
            <View style={styles.intentBox}>
              <Text style={styles.intentLabel}>INTENT SCORE</Text>
              <Text style={styles.intentNumber}>{plan.intent_score}</Text>
              <Text style={styles.intentBand}>{plan.intent_band}</Text>
            </View>
          </View>

          {/* Personal snapshot */}
          <Text style={styles.coverSnapshotTitle}>YOUR SNAPSHOT</Text>
          <Text style={styles.coverSnapshot}>{plan.personal_snapshot}</Text>

          <Text style={styles.coverMeta}>{`Timeline: ${formData.timeline} · ${formData.familyType}`}</Text>

          <View style={styles.coverFooter}>
            <Text style={styles.coverFooterText}>
              {`This plan was generated exclusively for ${formData.firstName}. © ${new Date().getFullYear()} Olim Paveway · www.olimpaveway.com`}
            </Text>
          </View>
        </View>
      </Page>

      {/* ─── Page 2: Profile + Assessment ──────────────── */}
      <Page size="A4" style={styles.bodyPage}>
        <Text style={styles.sectionTitleFirst}>Your Profile & What It Means</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxLabel}>PROFILE INSIGHT</Text>
          <Text style={styles.infoBoxText}>{plan.profile_meaning}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
          <View style={{ flex: 1 }}>
            <View style={[styles.infoBox, { marginBottom: 0 }]}>
              <Text style={styles.infoBoxLabel}>FROM {formData.country.toUpperCase()}</Text>
              <Text style={styles.infoBoxText}>{plan.country_notes}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.infoBox, { marginBottom: 0 }]}>
              <Text style={styles.infoBoxLabel}>{formData.targetArea.toUpperCase()}</Text>
              <Text style={styles.infoBoxText}>{plan.location_notes}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Personal Assessment</Text>
        {assessmentParagraphs.map((p, i) => (
          <Text key={i} style={styles.paragraph}>{p}</Text>
        ))}
      </Page>

      {/* ─── Page 3: Priority Actions ───────────────────── */}
      <Page size="A4" style={styles.bodyPage}>
        <Text style={styles.sectionTitleFirst}>Your 5 Priority Actions</Text>
        {plan.action_items.map((item, i) => (
          <View key={i} style={[styles.actionItem, { borderLeftColor: urgencyColor(item.urgency) }]}>
            <Text style={[styles.urgencyBadge, { backgroundColor: urgencyColor(item.urgency) }]}>
              {item.urgency.toUpperCase()}
            </Text>
            <Text style={styles.actionTitle}>{i + 1}. {item.title}</Text>
            <Text style={styles.actionDesc}>{item.description}</Text>
          </View>
        ))}
      </Page>

      {/* ─── Page 4: Timeline + Documents ──────────────── */}
      <Page size="A4" style={styles.bodyPage}>
        <Text style={styles.sectionTitleFirst}>Your Aliyah Timeline</Text>
        {plan.timeline_phases.map((phase, i) => (
          <View key={i} style={styles.timelinePhase}>
            <Text style={styles.phaseName}>{phase.phase}</Text>
            <Text style={styles.phaseDuration}>{phase.duration}</Text>
            {phase.tasks.map((task, j) => (
              <Text key={j} style={styles.phaseTask}>• {task}</Text>
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
                <Text style={styles.countryBadge}> ({formData.country})</Text>
              )}
            </Text>
          </View>
        ))}
      </Page>

      {/* ─── Page 5: Questions + Next Step + CTA ───────── */}
      <Page size="A4" style={styles.ctaPage}>
        <Text style={styles.sectionTitleFirst}>Questions for Your Consultation</Text>
        <Text style={[styles.paragraph, { marginBottom: 12 }]}>
          These questions are tailored to your profile — bring them to your free Olim Paveway consultation:
        </Text>
        {plan.consultation_questions.map((q, i) => (
          <View key={i} style={styles.questionRow}>
            <View style={styles.questionNum}>
              <Text style={styles.questionNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.questionText}>{q}</Text>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Your Next Step</Text>
        <View style={styles.nextStepBox}>
          <Text style={styles.nextStepLabel}>DO THIS WEEK</Text>
          <Text style={styles.nextStepText}>{plan.next_step}</Text>
        </View>

        <Text style={styles.ctaTitle}>Ready to Make Aliyah the Right Way?</Text>
        <Text style={styles.ctaText}>
          This plan gives you the roadmap. Olim Paveway gives you the team — handling everything from your application through your first year of integration.
        </Text>
        <View style={styles.ctaBox}>
          <Text style={styles.ctaBoxTitle}>What Olim Paveway handles for you:</Text>
          <Text style={styles.ctaBoxText}>
            {"✓ Aliyah application preparation and submission\n✓ Pre-aliyah pilot trip coordination\n✓ Housing search and lease review\n✓ Bank account opening assistance\n✓ School enrolment for children\n✓ Employment and business setup guidance\n✓ 12-month post-arrival support"}
          </Text>
        </View>
        <Text style={styles.website}>www.olimpaveway.com</Text>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>{plan.disclaimer}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateAliyahPdf(
  formData: Pick<FormSchema, "firstName" | "country" | "targetArea" | "timeline" | "familyType">,
  plan: AiPlanSchema
): Promise<Buffer> {
  const doc = <AliyahPlanDocument formData={formData} plan={plan} />;
  const blob = await pdf(doc).toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
