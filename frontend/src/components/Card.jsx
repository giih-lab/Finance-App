import "../styles/layout.css";

export default function Card({ label, value, subtitle, variant = "default" }) {
  let color = "#111827";
  if (variant === "income") color = "#16a34a";
  if (variant === "expense") color = "#dc2626";
  if (variant === "balance") color = "#1d4ed8";

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 16,
        padding: 18,
        boxShadow: "0 10px 30px rgba(15,23,42,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color }}>{value}</span>
      {subtitle && (
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{subtitle}</span>
      )}
    </div>
  );
}
