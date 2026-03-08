import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { Room } from "@/pages/Room";

export const roomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/room/$roomId",
  component: Room,
});
