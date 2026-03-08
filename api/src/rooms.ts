import { randomUUID } from "node:crypto";
import type { WebSocket } from "ws";

export type Client = {
  socket: WebSocket;
  username: string;
};

export type Room = {
  id: string;
  slots: number;
  token: string;
  clients: Map<string, Client>;
  moderator: { id: string; socket: WebSocket } | null;
  createdAt: number;
};

const rooms = new Map<string, Room>();

export function createRoom(slots: number): Room {
  const id = randomUUID();
  const token = randomUUID();
  const room: Room = {
    id,
    slots,
    token,
    clients: new Map(),
    moderator: null,
    createdAt: Date.now(),
  };
  rooms.set(id, room);
  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function isRoomExpired(room: Room): boolean {
  return Date.now() - room.createdAt >= 10 * 60 * 1000;
}

export function addClient(room: Room, clientId: string, client: Client): boolean {
  if (isRoomExpired(room) || room.clients.size >= room.slots) return false;
  room.clients.set(clientId, client);
  return true;
}

export function removeClient(room: Room, clientId: string): void {
  room.clients.delete(clientId);
}

export function getPlayerNames(room: Room): string[] {
  return Array.from(room.clients.values()).map((c) => c.username);
}

export function broadcastToRoom(room: Room, message: string): void {
  if (room.moderator?.socket.readyState === 1) {
    room.moderator.socket.send(message);
  }
  for (const client of room.clients.values()) {
    if (client.socket.readyState === 1) {
      client.socket.send(message);
    }
  }
}

export function clearRooms(): void {
  rooms.clear();
}
