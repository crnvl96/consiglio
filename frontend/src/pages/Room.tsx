import { useState } from "react";
import { useParams, useSearch } from "@tanstack/react-router";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SlotRing } from "@/components/ui/SlotRing";
import { useRoom } from "@/hooks/useRoom";

export function Room() {
  const { roomId } = useParams({ strict: false });
  const { token } = useSearch({ strict: false });
  const { status, error, locked, copyShareableUrl } = useRoom(roomId, token);
  const [copied, setCopied] = useState(false);

  const shareableUrl = `${window.location.origin}/room/${roomId}`;

  function handleCopy() {
    copyShareableUrl().then(() => {
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

  const subtitle = locked ? "Room is full — link expired" : "Waiting for players to join...";

  return (
    <PageShell>
      <div className="w-full max-w-sm space-y-8 text-center">
        <PageHeader title="Room" subtitle={subtitle} />
        {status && (
          <>
            <SlotRing slots={status.slots} connected={status.connected} />
            <p className="text-fg-muted text-sm">
              <span className="text-fg font-bold">{status.connected}</span>
              {" / "}
              <span>{status.slots}</span>
              {" players connected"}
            </p>
          </>
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
