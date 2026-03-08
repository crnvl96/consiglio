import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { addClient, broadcastToRoom, createRoom, getRoom, removeClient } from "./rooms.js";

type CreateRoomBody = {
  slots: number;
};

export async function registerRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateRoomBody }>("/rooms", async (request, reply) => {
    const { slots } = request.body;

    if (!Number.isInteger(slots) || slots < 1 || slots > 8) {
      return reply.status(400).send({ error: "slots must be an integer between 1 and 8" });
    }

    const room = createRoom(slots);
    return reply.status(201).send({ id: room.id, slots: room.slots });
  });

  app.get<{ Params: { id: string } }>("/rooms/:id/ws", { websocket: true }, (socket, request) => {
    const room = getRoom(request.params.id);

    if (!room) {
      socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
      socket.close();
      return;
    }

    const clientId = randomUUID();
    const joined = addClient(room, clientId, socket);

    if (!joined) {
      socket.send(JSON.stringify({ type: "error", message: "Room is full" }));
      socket.close();
      return;
    }

    socket.send(
      JSON.stringify({
        type: "joined",
        clientId,
        slots: room.slots,
        connected: room.clients.size,
      }),
    );

    broadcastToRoom(
      room,
      JSON.stringify({ type: "status", slots: room.slots, connected: room.clients.size }),
    );

    socket.on("close", () => {
      removeClient(room, clientId);
      broadcastToRoom(
        room,
        JSON.stringify({ type: "status", slots: room.slots, connected: room.clients.size }),
      );
    });
  });
}
