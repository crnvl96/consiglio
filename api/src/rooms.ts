import { randomUUID } from "node:crypto";
import type { WebSocket } from "ws";

export type Room = {
  id: string;
  slots: number;
  token: string;
  clients: Map<string, WebSocket>;
  moderator: { id: string; socket: WebSocket } | null;
  locked: boolean;
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
    locked: false,
    createdAt: Date.now(),
  };
  rooms.set(id, room);
  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function lockRoom(room: Room): void {
  room.locked = true;
}

export function isRoomLocked(room: Room): boolean {
  return room.locked || Date.now() - room.createdAt >= 10 * 60 * 1000;
}

export function addClient(room: Room, clientId: string, socket: WebSocket): boolean {
  if (isRoomLocked(room) || room.clients.size >= room.slots) return false;
  room.clients.set(clientId, socket);
  return true;
}

export function removeClient(room: Room, clientId: string): void {
  room.clients.delete(clientId);
}

export function broadcastToRoom(room: Room, message: string): void {
  if (room.moderator?.socket.readyState === 1) {
    room.moderator.socket.send(message);
  }
  for (const socket of room.clients.values()) {
    if (socket.readyState === 1) {
      socket.send(message);
    }
  }
}

export function deleteRoom(id: string): void {
  rooms.delete(id);
}

export function clearRooms(): void {
  rooms.clear();
}
