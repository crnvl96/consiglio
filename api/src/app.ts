import fastifyCors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import Fastify, { type FastifyInstance } from "fastify";
import { registerRoutes } from "./routes.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger: true,
  });

  app.register(fastifyCors, { origin: true });
  app.register(fastifyWebsocket);
  app.register(registerRoutes);

  return app;
}
