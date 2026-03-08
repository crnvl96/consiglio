import type { CreateRoomResponse } from "@consiglio/shared";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { NumberStepper } from "@/components/ui/NumberStepper";

async function createRoom(slots: number): Promise<CreateRoomResponse> {
  const response = await fetch("/rooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slots }),
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  return response.json();
}

export function Home() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createRoom,
    onSuccess: (data) => {
      navigate({ to: "/room/$roomId", params: { roomId: data.id } });
    },
  });

  const error = mutation.error
    ? mutation.error.message === "Failed to create room"
      ? "Failed to create room"
      : "Could not connect to server"
    : null;

  const handleCreate = () => {
    const input = document.getElementById("slots") as HTMLInputElement;
    const slots = Number(input.value);
    mutation.mutate(slots);
  };

  return (
    <PageShell>
      <div className="w-full max-w-sm space-y-8 text-center">
        <PageHeader title="Consiglio" subtitle="Spin up a room, fill the slots, decide together." />
        <Card>
          <div className="space-y-5">
            <Label htmlFor="slots">Slots</Label>
            <NumberStepper id="slots" min={1} max={8} defaultValue={1} />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button className="w-full" onClick={handleCreate}>
              Create new room
            </Button>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
