import { render, screen } from "@testing-library/react";
import Projects from "./Projects.tsx";

describe("Projects", () => {
  it("renders a card for each project", () => {
    render(<Projects />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: /view project/i })).toHaveLength(
      3,
    );
  });
});
