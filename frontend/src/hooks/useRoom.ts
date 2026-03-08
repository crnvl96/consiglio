import { useCallback, useEffect, useRef, useState } from "react";

type RoomStatus = {
  slots: number;
  connected: number;
  players: string[];
};

type Role = "moderator" | "player";

type RoomState = {
  status: RoomStatus | null;
  error: string | null;
  role: Role | null;
  username: string | null;
};

const initialState: RoomState = {
  status: null,
  error: null,
  role: null,
  username: null,
};

export function useRoom(roomId: string | undefined, token?: string) {
  const [state, setState] = useState<RoomState>(initialState);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    setState(initialState);

    const params = token ? `?token=${token}` : "";
    const ws = new WebSocket(`ws://${window.location.host}/rooms/${roomId}/ws${params}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "error") {
        setState((prev) => ({ ...prev, error: message.message }));
        return;
      }

      if (message.type === "joined") {
        setState((prev) => ({
          ...prev,
          role: message.role,
          username: message.username ?? null,
          status: {
            slots: message.slots,
            connected: message.connected,
            players: message.players,
          },
        }));
      }

      if (message.type === "status") {
        setState((prev) => ({
          ...prev,
          status: {
            slots: message.slots,
            connected: message.connected,
            players: message.players,
          },
        }));
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
  }, [roomId, token]);

  const copyShareableUrl = useCallback(() => {
    if (!roomId) return Promise.resolve();
    const url = `${window.location.origin}/room/${roomId}`;
    return navigator.clipboard.writeText(url);
  }, [roomId]);

  return { ...state, copyShareableUrl };
}
