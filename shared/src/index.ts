import { z } from "zod";

export const createRoomBodySchema = z.object({
  slots: z.number().int().min(1).max(8),
});

export const createRoomResponseSchema = z.object({
  id: z.string().uuid({ version: "v4" }),
  slots: z.number().int(),
  token: z.string().uuid({ version: "v4" }),
});

export type CreateRoomBody = z.infer<typeof createRoomBodySchema>;
export type CreateRoomResponse = z.infer<typeof createRoomResponseSchema>;
