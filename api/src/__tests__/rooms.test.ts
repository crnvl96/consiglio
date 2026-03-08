import { afterEach, describe, expect, it } from "vitest";
import type { WebSocket } from "ws";
import { addClient, clearRooms, createRoom, getRoom, removeClient } from "../rooms.js";

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
});

describe("getRoom", () => {
  it("returns undefined for a nonexistent room", () => {
    expect(getRoom("nonexistent")).toBeUndefined();
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
});

describe("removeClient", () => {
  it("removes a client from the room", () => {
    const room = createRoom(2);
    addClient(room, "client-1", fakeSocket);
    removeClient(room, "client-1");
    expect(room.clients.size).toBe(0);
  });
});
