import classnames from "classnames";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={classnames(
        "animate-slide-up rounded-xl border border-border-muted/25 bg-bg-dark/50 px-6 py-8 shadow-xl shadow-bg-dark/60 ring-1 ring-white/3 ring-inset backdrop-blur-md [animation-delay:160ms]",
        className,
      )}
    >
      {children}
    </div>
  );
}
