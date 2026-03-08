import { useEffect, useState } from "react";
import { useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
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
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareableUrl = `${window.location.origin}/room/${roomId}`;

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

      if (message.type === "locked") {
        setLocked(true);
      }
    };

    ws.onclose = () => {
      setError((prev) => prev ?? "Disconnected from room");
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  function handleCopy() {
    navigator.clipboard.writeText(shareableUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (error) {
    return (
      <PageShell>
        <div className="w-full max-w-sm space-y-8 text-center">
          <PageHeader title="Error" subtitle={error} />
        </div>
      </PageShell>
    );
  }

  const subtitle = locked ? "Room is full \u2014 link expired" : "Waiting for players to join...";

  return (
    <PageShell>
      <div className="w-full max-w-sm space-y-8 text-center">
        <PageHeader title="Room" subtitle={subtitle} />
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
        {status && !locked && (
          <Card>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                aria-label="Shareable link"
                className="min-w-0 flex-1 rounded-lg border border-border-muted bg-bg px-3 py-2 text-fg-muted"
              />
              <Button variant="ghost" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy link"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
