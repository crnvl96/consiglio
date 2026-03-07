import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Home } from "./Home";

test("renders a 'Create new room' button", () => {
  render(<Home />);
  expect(screen.getByRole("button", { name: /create new room/i })).toBeDefined();
});

test("renders a numerical input with a maximum value of 8", () => {
  render(<Home />);
  const input = screen.getByRole("spinbutton");
  expect(input).toBeDefined();
  expect(input.getAttribute("type")).toBe("number");
  expect(input.getAttribute("max")).toBe("8");
});

test("input has a label with text 'Slots: '", () => {
  render(<Home />);
  expect(screen.getByLabelText(/slots:/i)).toBeDefined();
});

test("input is not focusable by tab", async () => {
  const user = userEvent.setup();
  render(<Home />);
  const input = screen.getByRole("spinbutton") as HTMLInputElement;
  expect(input.tabIndex).toBe(-1);
  expect(input.readOnly).toBe(true);
  await user.tab();
  expect(input).not.toBe(document.activeElement);
});

test("does not allow typing directly into the input", async () => {
  const user = userEvent.setup();
  render(<Home />);
  const input = screen.getByRole("spinbutton") as HTMLInputElement;
  const valueBefore = input.value;
  await user.click(input);
  await user.keyboard("5");
  expect(input.value).toBe(valueBefore);
});
