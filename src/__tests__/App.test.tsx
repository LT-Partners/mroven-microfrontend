import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App", () => {
  it("renders the app title", () => {
    render(<App isActive={true} />);
    const title = screen.getByRole("heading", {
      name: /micro frontend template/i,
    });
    expect(title).toBeInTheDocument();
  });

  it("applies opacity when not active", () => {
    render(<App isActive={false} />);
    const container = screen
      .getByRole("heading", { name: /micro frontend template/i })
      .closest("div");
    expect(container).toHaveClass("opacity-50");
  });

  it("does not apply opacity when active", () => {
    render(<App isActive={true} />);
    const container = screen
      .getByRole("heading", { name: /micro frontend template/i })
      .closest("div");
    expect(container).not.toHaveClass("opacity-50");
  });
});
