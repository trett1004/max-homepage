import { render, screen } from "@testing-library/react";
import Contact from "./Contact.tsx";

describe("Contact", () => {
  it("renders contact links", () => {
    render(<Contact />);
    expect(
      screen.getByRole("link", { name: "you@example.com" }),
    ).toHaveAttribute("href", "mailto:you@example.com");
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/yourname",
    );
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/yourname",
    );
  });
});
