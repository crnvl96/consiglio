import { afterEach, describe, expect, it } from "vitest";
import WebSocket from "ws";
import { buildApp } from "../app.js";
import { clearRooms, getRoom } from "../rooms.js";

afterEach(() => {
  clearRooms();
});

describe("POST /rooms", () => {
  it("creates a room and returns its id and slots", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 3 },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.id).toBeDefined();
    expect(body.slots).toBe(3);

    await app.close();
  });

  it("rejects slots less than 1", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 0 },
    });

    expect(response.statusCode).toBe(400);

    await app.close();
  });

  it("rejects slots greater than 8", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 9 },
    });

    expect(response.statusCode).toBe(400);

    await app.close();
  });

  it("rejects non-integer slots", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 2.5 },
    });

    expect(response.statusCode).toBe(400);

    await app.close();
  });
});

describe("WebSocket /rooms/:id/ws", () => {
  it("sends a joined message when connecting to a valid room", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const createResponse = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 3 },
    });
    const { id } = createResponse.json();

    const ws = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws`);
    const message = await new Promise<string>((resolve) => {
      ws.on("message", (data: WebSocket.Data) => resolve(data.toString()));
    });

    const parsed = JSON.parse(message);
    expect(parsed.type).toBe("joined");
    expect(parsed.slots).toBe(3);
    expect(parsed.connected).toBe(1);
    expect(parsed.clientId).toBeDefined();

    ws.close();
    await app.close();
  });

  it("rejects connection to a nonexistent room", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const ws = new WebSocket(`ws://localhost:${port}/rooms/nonexistent/ws`);
    const message = await new Promise<string>((resolve) => {
      ws.on("message", (data: WebSocket.Data) => resolve(data.toString()));
    });

    const parsed = JSON.parse(message);
    expect(parsed.type).toBe("error");
    expect(parsed.message).toBe("Room not found");

    ws.close();
    await app.close();
  });

  it("rejects connection when room is full", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const createResponse = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 1 },
    });
    const { id } = createResponse.json();

    const ws1 = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws`);
    // Wait for ws1 to receive joined + status messages
    await new Promise<void>((resolve) => {
      ws1.on("message", (data: WebSocket.Data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === "status") resolve();
      });
    });

    const ws2 = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws`);
    const message = await new Promise<string>((resolve) => {
      ws2.on("message", (data) => resolve(data.toString()));
    });

    const parsed = JSON.parse(message);
    expect(parsed.type).toBe("error");
    expect(parsed.message).toBe("Room is full");

    ws1.close();
    ws2.close();
    await app.close();
  });

  it("allows new connections after a client disconnects from a full room", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const createResponse = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 1 },
    });
    const { id } = createResponse.json();

    const ws1 = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws`);
    await new Promise<void>((resolve) => {
      ws1.on("message", (data: WebSocket.Data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === "status") resolve();
      });
    });

    // Disconnect ws1 — room is now empty and should accept new connections
    ws1.close();
    await new Promise<void>((resolve) => {
      ws1.on("close", () => resolve());
    });

    const ws2 = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws`);
    const message = await new Promise<string>((resolve) => {
      ws2.on("message", (data) => resolve(data.toString()));
    });

    const parsed = JSON.parse(message);
    expect(parsed.type).toBe("joined");
    expect(parsed.connected).toBe(1);

    ws2.close();
    await app.close();
  });

  it("connects as moderator when token matches", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const createResponse = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 2 },
    });
    const { id, token } = createResponse.json();

    const ws = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws?token=${token}`);
    const message = await new Promise<string>((resolve) => {
      ws.on("message", (data: WebSocket.Data) => resolve(data.toString()));
    });

    const parsed = JSON.parse(message);
    expect(parsed.type).toBe("joined");
    expect(parsed.role).toBe("moderator");
    expect(parsed.connected).toBe(0);
    expect(parsed.players).toEqual([]);

    ws.close();
    await app.close();
  });

  it("does not count moderator as a connected player", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const createResponse = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 1 },
    });
    const { id, token } = createResponse.json();

    // Connect as moderator
    const wsMod = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws?token=${token}`);
    await new Promise<void>((resolve) => {
      wsMod.on("message", () => resolve());
    });

    // Connect as player — should succeed since moderator doesn't take a slot
    const wsPlayer = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws`);
    const message = await new Promise<string>((resolve) => {
      wsPlayer.on("message", (data: WebSocket.Data) => resolve(data.toString()));
    });

    const parsed = JSON.parse(message);
    expect(parsed.type).toBe("joined");
    expect(parsed.role).toBe("player");
    expect(parsed.connected).toBe(1);
    expect(parsed.username).toBeDefined();

    wsPlayer.close();
    wsMod.close();
    await app.close();
  });

  it("broadcasts status to moderator when a player joins", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const createResponse = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 2 },
    });
    const { id, token } = createResponse.json();

    const modMessages: unknown[] = [];
    const wsMod = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws?token=${token}`);
    let modNotify: (() => void) | null = null;
    wsMod.on("message", (data: WebSocket.Data) => {
      modMessages.push(JSON.parse(data.toString()));
      modNotify?.();
    });

    function waitForModCount(count: number): Promise<void> {
      if (modMessages.length >= count) return Promise.resolve();
      return new Promise<void>((resolve) => {
        modNotify = () => {
          if (modMessages.length >= count) {
            modNotify = null;
            resolve();
          }
        };
      });
    }

    // Moderator receives: joined => 1 message
    await waitForModCount(1);

    const wsPlayer = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws`);
    await new Promise<void>((resolve) => {
      wsPlayer.on("message", () => resolve());
    });

    // Moderator should also receive a status broadcast => 2 messages
    await waitForModCount(2);

    const statusMsg = modMessages[1] as any;
    expect(statusMsg.type).toBe("status");
    expect(statusMsg.connected).toBe(1);
    expect(statusMsg.players).toHaveLength(1);

    wsPlayer.close();
    wsMod.close();
    await app.close();
  });

  it("clears moderator on disconnect", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const createResponse = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 2 },
    });
    const { id, token } = createResponse.json();

    const wsMod = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws?token=${token}`);
    await new Promise<void>((resolve) => {
      wsMod.on("message", () => resolve());
    });

    const room = getRoom(id)!;
    expect(room.moderator).not.toBeNull();

    wsMod.close();
    await new Promise<void>((resolve) => {
      wsMod.on("close", () => resolve());
    });

    expect(room.moderator).toBeNull();

    await app.close();
  });

  it("does not clear new moderator when old moderator disconnects", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const createResponse = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 2 },
    });
    const { id, token } = createResponse.json();

    // Connect first moderator
    const wsMod1 = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws?token=${token}`);
    await new Promise<void>((resolve) => {
      wsMod1.on("message", () => resolve());
    });

    const room = getRoom(id)!;
    expect(room.moderator).not.toBeNull();
    const mod1Id = room.moderator!.id;

    // Connect second moderator (overwrites the first)
    const wsMod2 = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws?token=${token}`);
    await new Promise<void>((resolve) => {
      wsMod2.on("message", () => resolve());
    });

    const mod2Id = room.moderator!.id;
    expect(mod2Id).not.toBe(mod1Id);

    // Disconnect first moderator — should NOT clear room.moderator
    wsMod1.close();
    await new Promise<void>((resolve) => {
      wsMod1.on("close", () => resolve());
    });

    expect(room.moderator).not.toBeNull();
    expect(room.moderator!.id).toBe(mod2Id);

    wsMod2.close();
    await app.close();
  });

  it("rejects connections to expired rooms", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const createResponse = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 3 },
    });
    const { id } = createResponse.json();

    // Manually set createdAt to 10 minutes ago to simulate expiry
    const room = getRoom(id)!;
    room.createdAt = Date.now() - 10 * 60 * 1000;

    const ws = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws`);
    const message = await new Promise<string>((resolve) => {
      ws.on("message", (data) => resolve(data.toString()));
    });

    const parsed = JSON.parse(message);
    expect(parsed.type).toBe("error");
    expect(parsed.message).toBe("Room is closed");

    ws.close();
    await app.close();
  });

  it("broadcasts updated status when a client disconnects", async () => {
    const app = buildApp();
    await app.listen({ port: 0 });
    const port = (app.server.address() as { port: number }).port;

    const createResponse = await app.inject({
      method: "POST",
      url: "/rooms",
      payload: { slots: 3 },
    });
    const { id } = createResponse.json();

    // Collect all messages ws1 receives with a count-based wait helper
    const ws1Messages: unknown[] = [];
    const ws1 = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws`);
    let ws1Notify: (() => void) | null = null;
    ws1.on("message", (data: WebSocket.Data) => {
      ws1Messages.push(JSON.parse(data.toString()));
      ws1Notify?.();
    });

    function waitForWs1Count(count: number): Promise<void> {
      if (ws1Messages.length >= count) return Promise.resolve();
      return new Promise<void>((resolve) => {
        ws1Notify = () => {
          if (ws1Messages.length >= count) {
            ws1Notify = null;
            resolve();
          }
        };
      });
    }

    // ws1 receives: joined(1), status(1) => 2 messages
    await waitForWs1Count(2);

    const ws2 = new WebSocket(`ws://localhost:${port}/rooms/${id}/ws`);
    await new Promise<void>((resolve) => {
      ws2.on("message", (data: WebSocket.Data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === "status" && msg.connected === 2) resolve();
      });
    });

    // ws1 also receives status(2) => 3 messages total
    await waitForWs1Count(3);

    // Disconnect ws2, ws1 should receive status(1) => 4 messages total
    ws2.close();
    await waitForWs1Count(4);

    const lastStatus = ws1Messages[3] as any;
    expect(lastStatus.type).toBe("status");
    expect(lastStatus.connected).toBe(1);

    ws1.close();
    await app.close();
  });
});
