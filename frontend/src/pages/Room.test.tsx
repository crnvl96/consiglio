import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  expect(mockSocket.url).toContain("/rooms/my-room-123/ws");
});

test("shows connected/slots count after joining", async () => {
  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({
    type: "joined",
    clientId: "c1",
    slots: 5,
    connected: 1,
    players: ["Brave Otter"],
  });

  const counter = await screen.findByText(/players connected/);
  expect(counter.textContent).toBe("1 / 5 players connected");
});

test("updates count on status messages", async () => {
  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({
    type: "joined",
    clientId: "c1",
    slots: 3,
    connected: 1,
    players: ["Brave Otter"],
  });
  simulateMessage({
    type: "status",
    slots: 3,
    connected: 2,
    players: ["Brave Otter", "Sly Panda"],
  });

  const counter = await screen.findByText(/players connected/);
  expect(counter.textContent).toBe("2 / 3 players connected");
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

  simulateMessage({
    type: "joined",
    clientId: "c1",
    slots: 3,
    connected: 1,
    players: ["Brave Otter"],
  });

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

test("shows shareable link after joining", async () => {
  renderWithRouter("my-room-123");
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({
    type: "joined",
    clientId: "c1",
    slots: 5,
    connected: 1,
    players: ["Brave Otter"],
  });

  const input = await screen.findByLabelText("Shareable link");
  expect(input).toBeDefined();
  expect((input as HTMLInputElement).value).toContain("/room/my-room-123");
  expect((input as HTMLInputElement).readOnly).toBe(true);
});

test("copies link to clipboard when copy button is clicked", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });

  renderWithRouter("my-room-123");
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({
    type: "joined",
    clientId: "c1",
    slots: 5,
    connected: 1,
    players: ["Brave Otter"],
  });

  const copyButton = await screen.findByText("Copy link");
  await userEvent.click(copyButton);

  expect(writeText).toHaveBeenCalledWith(expect.stringContaining("/room/my-room-123"));
});

test("shows 'Copied!' after clicking copy button", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });

  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({
    type: "joined",
    clientId: "c1",
    slots: 3,
    connected: 1,
    players: ["Brave Otter"],
  });

  const copyButton = await screen.findByText("Copy link");
  await userEvent.click(copyButton);

  expect(await screen.findByText("Copied!")).toBeDefined();
});

test("renders slot indicators matching the slot count", async () => {
  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({
    type: "joined",
    clientId: "c1",
    slots: 4,
    connected: 1,
    players: ["Brave Otter"],
  });

  await waitFor(() => {
    const slotRing = screen.getByRole("list", { name: "Slot indicators" });
    const indicators = slotRing.querySelectorAll("li");
    expect(indicators).toHaveLength(4);
  });
});

test("slot indicators reflect connected count", async () => {
  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({
    type: "joined",
    clientId: "c1",
    slots: 3,
    connected: 2,
    players: ["Brave Otter", "Sly Panda"],
  });

  await waitFor(() => {
    const slotRing = screen.getByRole("list", { name: "Slot indicators" });
    const indicators = slotRing.querySelectorAll("li");
    const active = Array.from(indicators).filter((el) => el.dataset.active === "true");
    expect(active).toHaveLength(2);
  });
});

test("displays player usernames", async () => {
  renderWithRouter();
  await waitFor(() => expect(mockSocket).toBeDefined());

  simulateMessage({
    type: "joined",
    clientId: "c1",
    slots: 3,
    connected: 2,
    players: ["Brave Otter", "Sly Panda"],
  });

  const playerList = await screen.findByRole("list", { name: "Player list" });
  const items = playerList.querySelectorAll("li");
  expect(items).toHaveLength(2);
  expect(items[0].textContent).toBe("Brave Otter");
  expect(items[1].textContent).toBe("Sly Panda");
});
