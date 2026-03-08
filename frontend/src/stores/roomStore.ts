import { create } from "zustand";

const WS_BASE = `ws://${window.location.host}`;

type RoomStatus = {
  slots: number;
  connected: number;
};

type RoomState = {
  status: RoomStatus | null;
  error: string | null;
  locked: boolean;
};

type RoomActions = {
  connect: (roomId: string) => void;
  disconnect: () => void;
  reset: () => void;
};

const initialState: RoomState = {
  status: null,
  error: null,
  locked: false,
};

export const useRoomStore = create<RoomState & RoomActions>()((set, get) => {
  let ws: WebSocket | null = null;

  return {
    ...initialState,

    connect: (roomId: string) => {
      get().disconnect();

      ws = new WebSocket(`${WS_BASE}/rooms/${roomId}/ws`);

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "error") {
          set({ error: message.message });
          return;
        }

        if (message.type === "joined" || message.type === "status") {
          set({ status: { slots: message.slots, connected: message.connected } });
        }

        if (message.type === "locked") {
          set({ locked: true });
        }
      };

      ws.onclose = () => {
        set((state) => ({ error: state.error ?? "Disconnected from room" }));
      };
    },

    disconnect: () => {
      ws?.close();
      ws = null;
    },

    reset: () => {
      get().disconnect();
      set(initialState);
    },
  };
});
