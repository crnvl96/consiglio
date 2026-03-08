import { useCallback, useEffect, useRef, useState } from "react";

type RoomStatus = {
  slots: number;
  connected: number;
};

type RoomState = {
  status: RoomStatus | null;
  error: string | null;
  locked: boolean;
};

const initialState: RoomState = {
  status: null,
  error: null,
  locked: false,
};

export function useRoom(roomId: string | undefined) {
  const [state, setState] = useState<RoomState>(initialState);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setState(initialState);

    const ws = new WebSocket(`ws://${window.location.host}/rooms/${roomId}/ws`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "error") {
        setState((prev) => ({ ...prev, error: message.message }));
        return;
      }

      if (message.type === "joined" || message.type === "status") {
        setState((prev) => ({
          ...prev,
          status: { slots: message.slots, connected: message.connected },
        }));
      }

      if (message.type === "locked") {
        setState((prev) => ({ ...prev, locked: true }));
      }
    };

    ws.onclose = () => {
      setState((prev) => ({
        ...prev,
        error: prev.error ?? "Disconnected from room",
      }));
    };

    return () => {
      ws.onclose = null;
      ws.onmessage = null;
      ws.close();
      wsRef.current = null;
    };
  }, [roomId]);

  const copyShareableUrl = useCallback(() => {
    if (!roomId) return Promise.resolve();
    const url = `${window.location.origin}/room/${roomId}`;
    return navigator.clipboard.writeText(url);
  }, [roomId]);

  return { ...state, copyShareableUrl };
}
