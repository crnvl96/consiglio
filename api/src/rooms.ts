import { randomUUID } from "node:crypto";
import type { WebSocket } from "ws";

export type Room = {
  id: string;
  slots: number;
  clients: Map<string, WebSocket>;
};

const rooms = new Map<string, Room>();

export function createRoom(slots: number): Room {
  const id = randomUUID();
  const room: Room = { id, slots, clients: new Map() };
  rooms.set(id, room);
  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function addClient(room: Room, clientId: string, socket: WebSocket): boolean {
  if (room.clients.size >= room.slots) return false;
  room.clients.set(clientId, socket);
  return true;
}

export function removeClient(room: Room, clientId: string): void {
  room.clients.delete(clientId);
}

export function broadcastToRoom(room: Room, message: string): void {
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
