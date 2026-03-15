export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem" }}>
      <h1 style={{ fontSize: "4rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>404</h1>
      <p style={{ fontSize: "1.25rem", color: "#64748b", marginTop: "0.5rem" }}>Page not found</p>
      <a href="/" style={{ marginTop: "1.5rem", color: "#10b981", textDecoration: "underline" }}>Go home</a>
    </div>
  );
}
