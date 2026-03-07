import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { NumberStepper } from "@/components/ui/NumberStepper";

export function Home() {
  return (
    <PageShell>
      <div className="w-full max-w-sm space-y-8 text-center">
        <PageHeader title="Consiglio" subtitle="Spin up a room, fill the slots, decide together." />

        <Card>
          <div className="space-y-5">
            <Label htmlFor="slots">Slots</Label>
            <NumberStepper id="slots" min={1} max={8} defaultValue={1} />
            <Button className="w-full">Create new room</Button>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
