import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Card } from "@/components/ui/Card";

const WS_BASE = "ws://localhost:3000";

type RoomStatus = {
  slots: number;
  connected: number;
};

export function Room() {
  const { roomId } = useParams({ strict: false });
  const [status, setStatus] = useState<RoomStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(`${WS_BASE}/rooms/${roomId}/ws`);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "error") {
        setError(message.message);
        return;
      }

      if (message.type === "joined" || message.type === "status") {
        setStatus({ slots: message.slots, connected: message.connected });
      }
    };

    ws.onclose = () => {
      setError((prev) => prev ?? "Disconnected from room");
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  if (error) {
    return (
      <PageShell>
        <div className="w-full max-w-sm space-y-8 text-center">
          <PageHeader title="Error" subtitle={error} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="w-full max-w-sm space-y-8 text-center">
        <PageHeader title="Room" subtitle="Waiting for players to join..." />
        {status && (
          <Card>
            <p className="text-fg-muted">
              <span className="text-fg text-lg font-bold">{status.connected}</span>
              {" / "}
              <span>{status.slots}</span>
              {" players connected"}
            </p>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
