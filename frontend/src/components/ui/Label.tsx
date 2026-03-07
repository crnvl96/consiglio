import classnames from "classnames";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={classnames(
        "block text-[11px] font-medium tracking-[0.2em] text-fg-muted uppercase",
        className,
      )}
      {...props}
    />
  );
}
