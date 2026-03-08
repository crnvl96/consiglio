import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, expect, test, vi } from "vitest";
import { Home } from "./Home";

function renderWithRouter() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Home,
  });
  const roomRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/room/$roomId",
    component: () => <div>Room page</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, roomRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

test("renders a 'Create new room' button", async () => {
  renderWithRouter();
  expect(await screen.findByRole("button", { name: /create new room/i })).toBeDefined();
});

test("renders a numerical input with a maximum value of 8", async () => {
  renderWithRouter();
  const input = await screen.findByRole("spinbutton");
  expect(input).toBeDefined();
  expect(input.getAttribute("type")).toBe("number");
  expect(input.getAttribute("max")).toBe("8");
});

test("input has a label with text 'Slots'", async () => {
  renderWithRouter();
  expect(await screen.findByLabelText(/slots/i)).toBeDefined();
});

test("input is not focusable by tab", async () => {
  const user = userEvent.setup();
  renderWithRouter();
  const input = (await screen.findByRole("spinbutton")) as HTMLInputElement;
  expect(input.tabIndex).toBe(-1);
  expect(input.readOnly).toBe(true);
  await user.tab();
  expect(input).not.toBe(document.activeElement);
});

test("does not allow typing directly into the input", async () => {
  const user = userEvent.setup();
  renderWithRouter();
  const input = (await screen.findByRole("spinbutton")) as HTMLInputElement;
  const valueBefore = input.value;
  await user.click(input);
  await user.keyboard("5");
  expect(input.value).toBe(valueBefore);
});

test("calls POST /rooms and navigates to /room/:id on success", async () => {
  const user = userEvent.setup();
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ id: "abc-123", slots: 1 }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }),
  );

  renderWithRouter();
  const button = await screen.findByRole("button", { name: /create new room/i });
  await user.click(button);

  await waitFor(() => {
    expect(screen.getByText("Room page")).toBeDefined();
  });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    "/rooms",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ slots: 1 }),
    }),
  );
});

test("shows error when API call fails", async () => {
  const user = userEvent.setup();
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 500 }));

  renderWithRouter();
  const button = await screen.findByRole("button", { name: /create new room/i });
  await user.click(button);

  expect(await screen.findByText("Failed to create room")).toBeDefined();
});

test("shows error when network fails", async () => {
  const user = userEvent.setup();
  vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

  renderWithRouter();
  const button = await screen.findByRole("button", { name: /create new room/i });
  await user.click(button);

  expect(await screen.findByText("Could not connect to server")).toBeDefined();
});
