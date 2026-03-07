import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { NumberStepper } from "./NumberStepper";

test("increments value when + button is clicked", async () => {
  const user = userEvent.setup();
  render(<NumberStepper defaultValue={1} min={1} max={8} />);
  const input = screen.getByRole("spinbutton") as HTMLInputElement;
  await user.click(screen.getByRole("button", { name: "+" }));
  expect(input.value).toBe("2");
});

test("decrements value when − button is clicked", async () => {
  const user = userEvent.setup();
  render(<NumberStepper defaultValue={3} min={1} max={8} />);
  const input = screen.getByRole("spinbutton") as HTMLInputElement;
  await user.click(screen.getByRole("button", { name: "−" }));
  expect(input.value).toBe("2");
});

test("does not go below min", async () => {
  const user = userEvent.setup();
  render(<NumberStepper defaultValue={1} min={1} max={8} />);
  const input = screen.getByRole("spinbutton") as HTMLInputElement;
  await user.click(screen.getByRole("button", { name: "−" }));
  expect(input.value).toBe("1");
});

test("does not go above max", async () => {
  const user = userEvent.setup();
  render(<NumberStepper defaultValue={8} min={1} max={8} />);
  const input = screen.getByRole("spinbutton") as HTMLInputElement;
  await user.click(screen.getByRole("button", { name: "+" }));
  expect(input.value).toBe("8");
});

test("supports multiple increments", async () => {
  const user = userEvent.setup();
  render(<NumberStepper defaultValue={1} min={1} max={8} />);
  const input = screen.getByRole("spinbutton") as HTMLInputElement;
  const plus = screen.getByRole("button", { name: "+" });
  await user.click(plus);
  await user.click(plus);
  await user.click(plus);
  expect(input.value).toBe("4");
});
