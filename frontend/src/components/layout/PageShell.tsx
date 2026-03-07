import classnames from "classnames";

type PageShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={classnames(
        "flex min-h-screen flex-col items-center justify-center gap-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
