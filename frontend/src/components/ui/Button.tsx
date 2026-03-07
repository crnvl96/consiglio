import classnames from "classnames";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={classnames(
        "rounded-lg font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        variant === "primary" &&
          "bg-accent px-6 py-2.5 text-bg shadow-md shadow-accent/20 hover:bg-accent-bright hover:shadow-lg hover:shadow-accent/25 active:scale-[0.98]",
        variant === "ghost" &&
          "border border-border-muted bg-bg-highlight px-3 py-2 text-fg hover:bg-border-muted active:scale-[0.97]",
        className,
      )}
      {...props}
    />
  );
}
