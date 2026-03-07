import classnames from "classnames";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={classnames(
        "rounded-lg font-semibold transition-colors",
        variant === "primary" && "bg-accent px-6 py-2 text-bg hover:bg-accent-bright",
        variant === "ghost" &&
          "border border-border-muted bg-bg-highlight px-3 py-2 text-fg hover:bg-border-muted",
        className,
      )}
      {...props}
    />
  );
}
