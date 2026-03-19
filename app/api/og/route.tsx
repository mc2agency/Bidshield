import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "BidShield — Bid QA for Commercial Roofing";
  const type = searchParams.get("type") || "default"; // "article" | "default"

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#059669",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ color: "white", fontSize: "22px", fontWeight: 900 }}>B</div>
          </div>
          <div style={{ color: "#059669", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" }}>
            BidShield
          </div>
          {type === "article" && (
            <div
              style={{
                marginLeft: "12px",
                background: "#059669",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                padding: "4px 12px",
                borderRadius: "999px",
              }}
            >
              Commercial Roofing
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              color: "white",
              fontSize: title.length > 60 ? "42px" : "52px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-1px",
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
          <div style={{ color: "#64748b", fontSize: "20px", fontWeight: 500 }}>
            mc2estimating.com
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #1e293b",
            paddingTop: "24px",
          }}
        >
          <div style={{ color: "#475569", fontSize: "16px" }}>
            Bid QA for Commercial Roofing Estimators
          </div>
          <div
            style={{
              background: "#059669",
              color: "white",
              fontSize: "15px",
              fontWeight: 700,
              padding: "10px 24px",
              borderRadius: "8px",
            }}
          >
            Try Free →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
