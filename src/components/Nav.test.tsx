import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Nav from "./Nav.tsx";

describe("Nav", () => {
  it("renders links to all pages", () => {
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("marks the current route as active", () => {
    render(
      <MemoryRouter initialEntries={["/projects"]}>
        <Nav />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Projects" }).className).toMatch(
      /active/,
    );
    expect(screen.getByRole("link", { name: "Home" }).className).not.toMatch(
      /active/,
    );
  });
});
