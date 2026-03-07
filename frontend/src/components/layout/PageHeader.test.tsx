import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { PageHeader } from "./PageHeader";

test("renders title as an h1", () => {
  render(<PageHeader title="Consiglio" />);
  const heading = screen.getByRole("heading", { level: 1 });
  expect(heading.textContent).toBe("Consiglio");
});

test("renders subtitle when provided", () => {
  render(<PageHeader title="Consiglio" subtitle="A subtitle" />);
  expect(screen.getByText("A subtitle")).toBeDefined();
});

test("does not render subtitle element when omitted", () => {
  const { container } = render(<PageHeader title="Consiglio" />);
  expect(container.querySelector("p")).toBeNull();
});

test("renders inside a header element", () => {
  const { container } = render(<PageHeader title="Consiglio" />);
  expect(container.querySelector("header")).not.toBeNull();
});
