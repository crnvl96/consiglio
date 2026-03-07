import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Label } from "./Label";

test("renders a label element", () => {
  render(<Label htmlFor="test">Slots</Label>);
  const label = screen.getByText("Slots");
  expect(label.tagName).toBe("LABEL");
});

test("sets htmlFor attribute", () => {
  render(<Label htmlFor="slots">Slots</Label>);
  const label = screen.getByText("Slots");
  expect(label.getAttribute("for")).toBe("slots");
});

test("merges custom className", () => {
  render(<Label className="extra">Slots</Label>);
  const label = screen.getByText("Slots");
  expect(label.className).toContain("extra");
  expect(label.className).toContain("uppercase");
});
