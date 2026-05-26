import * as React from "react";

type DeliveryEmailProps = {
  firstName: string;
  readinessScore: number;
  targetArea: string;
  pdfUrl: string;
};

export function DeliveryEmail({
  firstName,
  readinessScore,
  targetArea,
  pdfUrl,
}: DeliveryEmailProps) {
  return (
    <html>
      <body
        style={{
          fontFamily: "'Georgia', serif",
          backgroundColor: "#F8F4E8",
          margin: 0,
          padding: 0,
        }}
      >
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: "#F8F4E8", padding: "40px 20px" }}
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: "#5C6B3A", padding: "32px 40px" }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "12px",
                        color: "#B8962E",
                        letterSpacing: "2px",
                      }}
                    >
                      OLIM PAVEWAY
                    </p>
                    <h1
                      style={{
                        margin: "8px 0 0",
                        fontSize: "24px",
                        color: "#ffffff",
                        fontWeight: "bold",
                      }}
                    >
                      Your Aliyah Plan is Ready
                    </h1>
                  </td>
                </tr>
                {/* Score + greeting */}
                <tr>
                  <td style={{ padding: "32px 40px 0" }}>
                    <table cellPadding="0" cellSpacing="0">
                      <tr>
                        <td
                          style={{
                            backgroundColor: "#B8962E",
                            borderRadius: "8px",
                            padding: "20px 32px",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              fontSize: "48px",
                              fontWeight: "bold",
                              color: "#ffffff",
                            }}
                          >
                            {readinessScore}
                          </p>
                          <p
                            style={{
                              margin: "4px 0 0",
                              fontSize: "10px",
                              color: "#ffffff",
                              letterSpacing: "1px",
                            }}
                          >
                            READINESS SCORE
                          </p>
                        </td>
                        <td style={{ paddingLeft: "24px", verticalAlign: "middle" }}>
                          <p style={{ margin: 0, fontSize: "16px", color: "#1A1A1A" }}>
                            Hi {firstName},
                          </p>
                          <p
                            style={{
                              margin: "8px 0 0",
                              fontSize: "14px",
                              color: "#6B7280",
                              lineHeight: "1.6",
                            }}
                          >
                            Your personalized aliyah action plan for {targetArea} is
                            attached to this email. It was created specifically for
                            your situation.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                {/* Body */}
                <tr>
                  <td style={{ padding: "24px 40px" }}>
                    <p style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "1.6" }}>
                      Your plan includes:
                    </p>
                    <ul
                      style={{
                        fontSize: "14px",
                        color: "#1A1A1A",
                        lineHeight: "2",
                        paddingLeft: "20px",
                      }}
                    >
                      <li>Your personal readiness assessment</li>
                      <li>5 priority action items ranked by urgency</li>
                      <li>A phased aliyah timeline for your situation</li>
                      <li>A document checklist specific to your country of origin</li>
                    </ul>
                    <p style={{ fontSize: "14px", color: "#1A1A1A", lineHeight: "1.6" }}>
                      The PDF is attached below. You can also{" "}
                      <a href={pdfUrl} style={{ color: "#5C6B3A" }}>
                        view it online
                      </a>
                      .
                    </p>
                  </td>
                </tr>
                {/* CTA */}
                <tr>
                  <td style={{ padding: "0 40px 32px" }}>
                    <a
                      href="https://www.olimpaveway.com/consultation"
                      style={{
                        display: "inline-block",
                        backgroundColor: "#5C6B3A",
                        color: "#ffffff",
                        padding: "14px 32px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "bold",
                      }}
                    >
                      Book Your Free Consultation
                    </a>
                  </td>
                </tr>
                {/* Footer */}
                <tr>
                  <td
                    style={{
                      backgroundColor: "#F8F4E8",
                      padding: "24px 40px",
                      borderTop: "1px solid #e5e7eb",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "11px", color: "#9CA3AF" }}>
                      © {new Date().getFullYear()} Olim Paveway · www.olimpaveway.com
                      <br />
                      You received this because you requested an aliyah plan. To
                      unsubscribe, reply with &quot;unsubscribe&quot;.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
