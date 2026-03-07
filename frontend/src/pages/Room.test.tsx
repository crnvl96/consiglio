import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Room } from "./Room";

test("renders a welcome heading", () => {
  render(<Room />);
  expect(screen.getByRole("heading", { name: /welcome/i })).toBeDefined();
});

test("renders inside a PageShell", () => {
  const { container } = render(<Room />);
  expect(container.querySelector(".min-h-screen")).toBeDefined();
});
