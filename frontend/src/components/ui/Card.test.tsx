import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Card } from "./Card";

test("renders children", () => {
  render(<Card>Hello</Card>);
  expect(screen.getByText("Hello")).toBeDefined();
});

test("renders as a div by default", () => {
  render(<Card>content</Card>);
  expect(screen.getByText("content").tagName).toBe("DIV");
});

test("merges custom className", () => {
  render(<Card className="my-custom">content</Card>);
  const el = screen.getByText("content");
  expect(el.className).toContain("my-custom");
  expect(el.className).toContain("rounded-xl");
});
