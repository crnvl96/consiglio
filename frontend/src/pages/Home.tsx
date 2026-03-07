import { PageShell } from "../components/layout/PageShell";
import { Button } from "../components/ui/Button";
import { NumberStepper } from "../components/ui/NumberStepper";

export function Home() {
  return (
    <PageShell>
      <h1 className="text-4xl font-bold text-accent">Consiglio</h1>
      <label htmlFor="slots" className="text-fg">
        Slots:{" "}
      </label>
      <NumberStepper id="slots" min={1} max={8} defaultValue={1} />
      <Button>Create new room</Button>
    </PageShell>
  );
}
