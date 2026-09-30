import { motion } from "framer-motion";
import { ReactNode } from "react";

export function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-sub">{subtitle}</p>}
      {children}
    </motion.div>
  );
}

export function Panel({ title, hint, children }: { title?: string; hint?: string; children: ReactNode }) {
  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
    >
      {title && <h3>{title}</h3>}
      {hint && <p className="hint">{hint}</p>}
      {children}
    </motion.div>
  );
}

export function Chip({ children, tone = "" }: { children: ReactNode; tone?: string }) {
  return <span className={`chip ${tone}`}>{children}</span>;
}

export function Callout({ children, tone = "" }: { children: ReactNode; tone?: string }) {
  return <div className={`callout ${tone}`}>{children}</div>;
}

/** Primary action button that shows a spinner while `loading`. */
export function RunButton({ onClick, loading, disabled, children }: {
  onClick: () => void; loading?: boolean; disabled?: boolean; children: ReactNode;
}) {
  return (
    <button className="btn" onClick={onClick} disabled={loading || disabled}>
      {loading ? <span className="spinner" /> : children}
    </button>
  );
}

/** Animated horizontal bar for scores (0..1). */
export function Bar({ value, label, color = "var(--accent)", max = 1 }: { value: number; label: string; color?: string; max?: number }) {
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color: "var(--muted)" }}>{value.toFixed(3)}</span>
      </div>
      <div className="bar-track">
        <motion.div
          className="bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
