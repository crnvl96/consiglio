import { act, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { afterEach, expect, test, vi } from "vitest";
import { Room } from "./Room";

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
  vi.clearAllMocks();
});

function renderWithRouter(roomId = "test-room-id") {
  const rootRoute = createRootRoute();
  const roomRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/room/$roomId",
    component: Room,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([roomRoute]),
    history: createMemoryHistory({ initialEntries: [`/room/${roomId}`] }),
  });
  return render(<RouterProvider router={router} />);
}

function simulateMessage(message: Record<string, unknown>) {
  act(() => {
    mockSocket.onmessage?.({ data: JSON.stringify(message) });
  });
}

test("connects to the WebSocket with the room ID", async () => {
  renderWithRouter("my-room-123");
  await waitFor(() => expect(mockSocket).toBeDefined());
  expect(mockSocket.url).toBe("ws://localhost:3000/rooms/my-room-123/ws");
});

test("shows connected/slots count after joining", async () => {
  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({ type: "joined", clientId: "c1", slots: 5, connected: 1 });

  expect(await screen.findByText("1")).toBeDefined();
  expect(screen.getByText("5")).toBeDefined();
  expect(screen.getByText(/players connected/)).toBeDefined();
});

test("updates count on status messages", async () => {
  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({ type: "joined", clientId: "c1", slots: 3, connected: 1 });
  simulateMessage({ type: "status", slots: 3, connected: 2 });

  expect(await screen.findByText("2")).toBeDefined();
});

test("shows error when room is not found", async () => {
  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({ type: "error", message: "Room not found" });

  expect(await screen.findByText("Room not found")).toBeDefined();
});

test("shows error when room is full", async () => {
  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({ type: "error", message: "Room is full" });

  expect(await screen.findByText("Room is full")).toBeDefined();
});

test("shows disconnection error when WebSocket closes unexpectedly", async () => {
  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({ type: "joined", clientId: "c1", slots: 3, connected: 1 });

  act(() => {
    mockSocket.onclose?.();
  });

  expect(await screen.findByText("Disconnected from room")).toBeDefined();
});

test("cleans up WebSocket on unmount", async () => {
  const { unmount } = renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  unmount();
  expect(mockSocket.close).toHaveBeenCalled();
});
