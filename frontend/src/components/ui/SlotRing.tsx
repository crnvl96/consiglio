import classnames from "classnames";

type SlotRingProps = {
  slots: number;
  connected: number;
  selfIndex?: number;
};

export function SlotRing({ slots, connected, selfIndex = -1 }: SlotRingProps) {
  const radius = slots <= 2 ? 64 : 80;

  return (
    <div className="relative mx-auto" style={{ width: radius * 2 + 40, height: radius * 2 + 40 }}>
      <ul className="absolute inset-0" role="list" aria-label="Slot indicators">
        {Array.from({ length: slots }, (_, i) => {
          const active = i < connected;
          const isSelf = i === selfIndex;
          const angle = (2 * Math.PI * i) / slots - Math.PI / 2;
          const cx = radius * Math.cos(angle);
          const cy = radius * Math.sin(angle);

          return (
            <li
              key={i}
              role="listitem"
              data-active={active}
              data-self={isSelf}
              className={classnames(
                "absolute flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-500",
                !active && "border-border-muted/30 bg-bg-dark/40 text-fg-muted/30",
                active &&
                  !isSelf &&
                  "animate-slot-in border-accent/60 bg-accent/15 text-accent shadow-[0_0_12px_var(--color-accent)/0.3]",
                active &&
                  isSelf &&
                  "animate-slot-in border-tokyonight-night-green1/60 bg-tokyonight-night-green1/15 text-tokyonight-night-green1 shadow-[0_0_12px_var(--color-tokyonight-night-green1)/0.3]",
              )}
              style={{
                left: `calc(50% + ${cx}px - 1.25rem)`,
                top: `calc(50% + ${cy}px - 1.25rem)`,
                animationDelay: active ? `${i * 80}ms` : undefined,
              }}
            >
              <span className="text-xs font-semibold select-none">{i + 1}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
