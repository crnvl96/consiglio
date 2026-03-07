import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";

export function Room() {
  return (
    <PageShell>
      <div className="w-full max-w-sm space-y-8 text-center">
        <PageHeader title="Welcome" subtitle="Your room is ready." />
      </div>
    </PageShell>
  );
}
