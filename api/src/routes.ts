import { randomUUID } from "node:crypto";
import { createRoomBodySchema, createRoomResponseSchema } from "@consiglio/shared";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  addClient,
  broadcastToRoom,
  createRoom,
  getRoom,
  isRoomExpired,
  removeClient,
} from "./rooms.js";

const wsParamsSchema = z.object({
  id: z.string(),
});

const wsQuerySchema = z.object({
  token: z.string().optional(),
});

export async function registerRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/rooms",
    {
      schema: {
        body: createRoomBodySchema,
        response: { 201: createRoomResponseSchema },
      },
    },
    async (request, reply) => {
      const { slots } = request.body;
      const room = createRoom(slots);
      return reply.status(201).send({ id: room.id, slots: room.slots, token: room.token });
    },
  );

  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/rooms/:id/ws",
      { websocket: true, schema: { params: wsParamsSchema, querystring: wsQuerySchema } },
      (socket, request) => {
        const room = getRoom(request.params.id);

        if (!room) {
          socket.send(JSON.stringify({ type: "error", message: "Room not found" }));
          socket.close();
          return;
        }

        if (isRoomExpired(room)) {
          socket.send(JSON.stringify({ type: "error", message: "Room is closed" }));
          socket.close();
          return;
        }

        const clientId = randomUUID();
        const isModerator = request.query.token === room.token;

        if (isModerator) {
          room.moderator = { id: clientId, socket };

          socket.send(
            JSON.stringify({
              type: "joined",
              clientId,
              role: "moderator",
              slots: room.slots,
              connected: room.clients.size,
            }),
          );

          socket.on("close", () => {
            if (room.moderator?.id === clientId) {
              room.moderator = null;
            }
          });

          return;
        }

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
            role: "player",
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
      },
    );
}
