import { act } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useRoomStore } from "./roomStore";

class MockSocket {
  url: string;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  close = vi.fn();
  send = vi.fn();

  constructor(url: string) {
    this.url = url;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    mockSocket = this;
  }
}

let mockSocket: MockSocket;

vi.stubGlobal("WebSocket", MockSocket);

afterEach(() => {
  useRoomStore.getState().reset();
  vi.clearAllMocks();
});

function simulateMessage(message: Record<string, unknown>) {
  act(() => {
    mockSocket.onmessage?.({ data: JSON.stringify(message) });
  });
}

test("starts with initial state", () => {
  const state = useRoomStore.getState();
  expect(state.status).toBeNull();
  expect(state.error).toBeNull();
  expect(state.locked).toBe(false);
});

test("connect opens a WebSocket to the room", () => {
  useRoomStore.getState().connect("room-123");
  expect(mockSocket.url).toBe("ws://localhost:3000/rooms/room-123/ws");
});

test("sets status on joined message", () => {
  useRoomStore.getState().connect("room-123");
  simulateMessage({ type: "joined", clientId: "c1", slots: 5, connected: 1 });
  expect(useRoomStore.getState().status).toEqual({ slots: 5, connected: 1 });
});

test("updates status on status message", () => {
  useRoomStore.getState().connect("room-123");
  simulateMessage({ type: "joined", clientId: "c1", slots: 3, connected: 1 });
  simulateMessage({ type: "status", slots: 3, connected: 2 });
  expect(useRoomStore.getState().status).toEqual({ slots: 3, connected: 2 });
});

test("sets error on error message", () => {
  useRoomStore.getState().connect("room-123");
  simulateMessage({ type: "error", message: "Room not found" });
  expect(useRoomStore.getState().error).toBe("Room not found");
});

test("sets locked on locked message", () => {
  useRoomStore.getState().connect("room-123");
  simulateMessage({ type: "locked" });
  expect(useRoomStore.getState().locked).toBe(true);
});

test("sets disconnection error on WebSocket close", () => {
  useRoomStore.getState().connect("room-123");
  act(() => {
    mockSocket.onclose?.();
  });
  expect(useRoomStore.getState().error).toBe("Disconnected from room");
});

test("does not overwrite existing error on close", () => {
  useRoomStore.getState().connect("room-123");
  simulateMessage({ type: "error", message: "Room is full" });
  act(() => {
    mockSocket.onclose?.();
  });
  expect(useRoomStore.getState().error).toBe("Room is full");
});

test("disconnect closes the WebSocket", () => {
  useRoomStore.getState().connect("room-123");
  useRoomStore.getState().disconnect();
  expect(mockSocket.close).toHaveBeenCalled();
});

test("reset clears state and closes WebSocket", () => {
  useRoomStore.getState().connect("room-123");
  simulateMessage({ type: "joined", clientId: "c1", slots: 3, connected: 1 });
  useRoomStore.getState().reset();

  const state = useRoomStore.getState();
  expect(state.status).toBeNull();
  expect(state.error).toBeNull();
  expect(state.locked).toBe(false);
  expect(mockSocket.close).toHaveBeenCalled();
});
