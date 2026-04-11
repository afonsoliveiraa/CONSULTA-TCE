import { type FunctionalComponent } from "preact";

export const StatCard: FunctionalComponent<{
  label: string;
  value: string;
  tone?: "primary" | "success" | "warning" | "info";
}> = ({ label, value, tone = "primary" }) => (
  <article class={`stat-card stat-card--${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);
