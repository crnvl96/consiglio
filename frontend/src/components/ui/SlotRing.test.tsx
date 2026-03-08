import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { SlotRing } from "./SlotRing";

test("renders the correct number of slot indicators", () => {
  render(<SlotRing slots={4} connected={2} />);
  const indicators = screen.getAllByRole("listitem");
  expect(indicators).toHaveLength(4);
});

test("marks connected slots as active", () => {
  render(<SlotRing slots={3} connected={2} />);
  const indicators = screen.getAllByRole("listitem");
  const active = indicators.filter((el) => el.dataset.active === "true");
  expect(active).toHaveLength(2);
});

test("marks remaining slots as inactive", () => {
  render(<SlotRing slots={5} connected={2} />);
  const indicators = screen.getAllByRole("listitem");
  const inactive = indicators.filter((el) => el.dataset.active === "false");
  expect(inactive).toHaveLength(3);
});

test("all slots are active when room is full", () => {
  render(<SlotRing slots={3} connected={3} />);
  const indicators = screen.getAllByRole("listitem");
  const active = indicators.filter((el) => el.dataset.active === "true");
  expect(active).toHaveLength(3);
});

test("no slots are active when no one is connected", () => {
  render(<SlotRing slots={4} connected={0} />);
  const indicators = screen.getAllByRole("listitem");
  const active = indicators.filter((el) => el.dataset.active === "true");
  expect(active).toHaveLength(0);
});

test("renders with a single slot", () => {
  render(<SlotRing slots={1} connected={0} />);
  const indicators = screen.getAllByRole("listitem");
  expect(indicators).toHaveLength(1);
});
