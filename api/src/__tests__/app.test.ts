import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

describe("app", () => {
  it("returns 404 for unknown routes", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/nonexistent",
    });

    expect(response.statusCode).toBe(404);

    await app.close();
  });

  it("builds a fastify instance with logger enabled", () => {
    const app = buildApp();

    expect(app.log).toBeDefined();

    app.close();
  });
});
