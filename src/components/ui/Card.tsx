import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export default function Card({
  interactive = false,
  style,
  children,
  ...props
}: CardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-tertiary)",
        border: "1px solid rgba(30, 19, 16, 0.06)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        transition: "all var(--transition-base)",
        cursor: interactive ? "pointer" : "default",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
