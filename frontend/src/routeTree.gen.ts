import { rootRoute } from "@/routes/__root";
import { indexRoute } from "@/routes/index";
import { roomRoute } from "@/routes/room";

export const routeTree = rootRoute.addChildren([indexRoute, roomRoute]);
