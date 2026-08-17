type EnrollArgs = {
  email: string;
  firstName: string;
  phone: string | null;
  country: string;
  targetArea: string;
  timeline: string;
  familyType: string;
  career: string;
  concerns: string[];
  readinessScore: number;
};

export async function enrollInFluentCRM(data: EnrollArgs): Promise<void> {
  const base = process.env.FLUENTCRM_BASE_URL;
  const username = process.env.FLUENTCRM_USERNAME;
  const appPassword = process.env.FLUENTCRM_APP_PASSWORD;

  if (!base || !username || !appPassword) {
    console.log("[CRM] FluentCRM not configured, skipping enrollment");
    return;
  }

  const credentials = Buffer.from(`${username}:${appPassword}`).toString(
    "base64"
  );
  const scoreBand = `${Math.floor(data.readinessScore / 10) * 10}+`;

  try {
    const res = await fetch(`${base}/subscribers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        email: data.email,
        first_name: data.firstName,
        ...(data.phone ? { phone: data.phone } : {}),
        status: "subscribed",
        tags: [
          `country:${data.country}`,
          `area:${data.targetArea}`,
          `timeline:${data.timeline}`,
          `family:${data.familyType}`,
          `score:${scoreBand}`,
          "source:navigator-tool",
        ],
        custom_values: {
          country: data.country,
          target_area: data.targetArea,
          timeline: data.timeline,
          family_type: data.familyType,
          career: data.career,
          concerns: data.concerns.join(", "),
          readiness_score: String(data.readinessScore),
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[CRM] FluentCRM enrollment failed:", res.status, body);
    } else {
      console.log("[CRM] Enrolled in FluentCRM:", data.email);
    }
  } catch (err) {
    // Non-fatal — never block the user flow for a CRM error
    console.error("[CRM] FluentCRM enrollment error:", err);
  }
}
