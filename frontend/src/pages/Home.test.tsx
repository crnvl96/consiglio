import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Home } from "./Home";

test("renders a 'Create new room' button", () => {
  render(<Home />);
  expect(screen.getByRole("button", { name: /create new room/i })).toBeDefined();
});
