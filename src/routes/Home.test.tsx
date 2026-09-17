import { render, screen } from "@testing-library/react";
import Home from "./Home.tsx";

vi.mock("../three/LandingHero.tsx", () => ({
  default: () => <div data-testid="landing-hero-stub" />,
}));

describe("Home", () => {
  it("renders the hero pitch and mounts the landing hero", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Your Name",
    );
    expect(screen.getByTestId("landing-hero-stub")).toBeInTheDocument();
  });
});
