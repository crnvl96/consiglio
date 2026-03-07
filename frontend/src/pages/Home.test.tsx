import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { expect, test } from "vitest";
import { Home } from "./Home";

function renderWithRouter() {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Home,
  });
  const roomRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/room",
    component: () => <div>Room page</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, roomRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  return render(<RouterProvider router={router} />);
}

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

test("navigates to /room when 'Create new room' is clicked", async () => {
  const user = userEvent.setup();
  renderWithRouter();
  const button = await screen.findByRole("button", { name: /create new room/i });
  await user.click(button);
  await waitFor(() => {
    expect(screen.getByText("Room page")).toBeDefined();
  });
});
