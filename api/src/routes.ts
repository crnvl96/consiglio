import { randomUUID } from "node:crypto";
import { createRoomBodySchema, createRoomResponseSchema } from "@consiglio/shared";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  addClient,
  broadcastToRoom,
  createRoom,
  getPlayerNames,
  getRoom,
  isRoomExpired,
  removeClient,
} from "./rooms.js";
import { generateUsername } from "./usernames.js";

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
              players: getPlayerNames(room),
            }),
          );

          socket.on("close", () => {
            if (room.moderator?.id === clientId) {
              room.moderator = null;
            }
          });

          return;
        }

        const username = generateUsername();
        const joined = addClient(room, clientId, { socket, username });

        if (!joined) {
          socket.send(JSON.stringify({ type: "error", message: "Room is full" }));
          socket.close();
          return;
        }

        const players = getPlayerNames(room);

        socket.send(
          JSON.stringify({
            type: "joined",
            clientId,
            role: "player",
            username,
            slots: room.slots,
            connected: room.clients.size,
            players,
          }),
        );

        broadcastToRoom(
          room,
          JSON.stringify({
            type: "status",
            slots: room.slots,
            connected: room.clients.size,
            players,
          }),
        );

        socket.on("close", () => {
          removeClient(room, clientId);
          const updatedPlayers = getPlayerNames(room);
          broadcastToRoom(
            room,
            JSON.stringify({
              type: "status",
              slots: room.slots,
              connected: room.clients.size,
              players: updatedPlayers,
            }),
          );
        });
      },
    );
}
