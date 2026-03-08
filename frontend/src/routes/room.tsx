import { createRoute } from "@tanstack/react-router";
import { z } from "zod";
import { rootRoute } from "./__root";
import { Room } from "@/pages/Room";

const roomSearchSchema = z.object({
  token: z.string().optional(),
});

export const roomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/room/$roomId",
  component: Room,
  validateSearch: roomSearchSchema,
});
