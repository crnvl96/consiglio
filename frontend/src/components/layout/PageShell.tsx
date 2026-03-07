import classnames from "classnames";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={classnames(
        "relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-150 w-150 rounded-full bg-accent/4 blur-[120px]"
      />
      <div className="relative">{children}</div>
    </div>
  );
}
