import { PageShell } from "../components/layout/PageShell";
import { Button } from "../components/ui/Button";
import { NumberStepper } from "../components/ui/NumberStepper";

export function Home() {
  return (
    <PageShell>
      <div className="w-full max-w-sm space-y-8 text-center">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-accent">Consiglio</h1>
          <p className="text-sm text-fg-muted">Spin up a room, fill the slots, decide together.</p>
        </header>

        <div className="rounded-xl border border-border-muted/40 bg-bg-dark/60 px-6 py-8 shadow-lg shadow-bg-dark/50 backdrop-blur-sm">
          <div className="space-y-5">
            <label
              htmlFor="slots"
              className="block text-xs font-medium tracking-widest text-fg-muted uppercase"
            >
              Slots
            </label>
            <NumberStepper id="slots" min={1} max={8} defaultValue={1} />
            <Button className="w-full">Create new room</Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
