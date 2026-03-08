import { afterEach, describe, expect, it, vi } from "vitest";
import type { WebSocket } from "ws";
import {
  addClient,
  clearRooms,
  createRoom,
  getRoom,
  isRoomExpired,
  removeClient,
} from "../rooms.js";

const fakeSocket = { readyState: 1, send: () => {} } as unknown as WebSocket;

afterEach(() => {
  clearRooms();
});

describe("createRoom", () => {
  it("creates a room with the given slot count", () => {
    const room = createRoom(3);
    expect(room.slots).toBe(3);
    expect(room.id).toBeDefined();
    expect(room.clients.size).toBe(0);
  });

  it("stores the room so it can be retrieved by id", () => {
    const room = createRoom(2);
    expect(getRoom(room.id)).toBe(room);
  });

  it("sets createdAt timestamp", () => {
    const before = Date.now();
    const room = createRoom(3);
    const after = Date.now();
    expect(room.createdAt).toBeGreaterThanOrEqual(before);
    expect(room.createdAt).toBeLessThanOrEqual(after);
  });
});

describe("getRoom", () => {
  it("returns undefined for a nonexistent room", () => {
    expect(getRoom("nonexistent")).toBeUndefined();
  });
});

describe("isRoomExpired", () => {
  it("returns false for a fresh room", () => {
    const room = createRoom(2);
    expect(isRoomExpired(room)).toBe(false);
  });

  it("returns true when room is older than 10 minutes", () => {
    vi.useFakeTimers();
    try {
      const room = createRoom(2);
      expect(isRoomExpired(room)).toBe(false);
      vi.advanceTimersByTime(10 * 60 * 1000);
      expect(isRoomExpired(room)).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("addClient", () => {
  it("adds a client to the room", () => {
    const room = createRoom(2);
    expect(addClient(room, "client-1", fakeSocket)).toBe(true);
    expect(room.clients.has("client-1")).toBe(true);
  });

  it("rejects when room is full", () => {
    const room = createRoom(1);
    addClient(room, "client-1", fakeSocket);
    expect(addClient(room, "client-2", fakeSocket)).toBe(false);
    expect(room.clients.size).toBe(1);
  });

  it("rejects when room is expired", () => {
    vi.useFakeTimers();
    try {
      const room = createRoom(2);
      vi.advanceTimersByTime(10 * 60 * 1000);
      expect(addClient(room, "client-1", fakeSocket)).toBe(false);
      expect(room.clients.size).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("removeClient", () => {
  it("removes a client from the room", () => {
    const room = createRoom(2);
    addClient(room, "client-1", fakeSocket);
    removeClient(room, "client-1");
    expect(room.clients.size).toBe(0);
  });
});
