interface ProgressBarProps {
  /** Porcentaje de 0 a 100 */
  value: number;
  /** Label que se muestra debajo */
  label?: string;
  /** Optional override for label color */
  labelColor?: string;
  /** Optional gradient or solid color for the bar fill */
  barColor?: string;
}

export default function ProgressBar({ value, label, labelColor, barColor }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div style={{ paddingLeft: '12px', paddingRight: '12px' }}>
      <div
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "var(--color-bg-tertiary)",
          borderRadius: "var(--radius-pill)",
          overflow: "hidden",
        }}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          style={{
            width: `${clampedValue}%`,
            height: "4px",
            background: barColor ?? "var(--color-accent)",
            borderRadius: "var(--radius-pill)",
            transition: "width 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
      {label && (
        <p
          style={{
            fontFamily: "var(--font-host-grotesk)",
            fontSize: "var(--text-body-sm)",
            color: labelColor ?? "var(--color-text-secondary)",
            textAlign: "right",
            marginTop: "var(--space-2)",
          }}
        >
          {label}
        </p>
      )}
    </div>
  );
}
