type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="space-y-3">
      <h1 className="animate-slide-up font-display text-5xl tracking-tight text-accent">{title}</h1>
      {subtitle && (
        <p className="animate-slide-up text-sm font-light tracking-wide text-fg-muted [animation-delay:80ms]">
          {subtitle}
        </p>
      )}
    </header>
  );
}
