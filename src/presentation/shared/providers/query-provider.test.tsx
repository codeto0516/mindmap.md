import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryProvider } from "./query-provider";

describe("QueryProvider", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.stubEnv("NODE_ENV", originalNodeEnv ?? "test");
  });

  it("子要素をレンダリングする", () => {
    render(
      <QueryProvider>
        <span data-testid="child">Child</span>
      </QueryProvider>
    );
    expect(screen.getByTestId("child")).toHaveTextContent("Child");
  });

  it("NODE_ENV が development のときも子要素をレンダリングする", () => {
    vi.stubEnv("NODE_ENV", "development");
    render(
      <QueryProvider>
        <span data-testid="child">Child</span>
      </QueryProvider>
    );
    expect(screen.getByTestId("child")).toHaveTextContent("Child");
  });
});
