import { NavLink } from "react-router-dom";
import styles from "./Nav.module.css";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

export default function Nav() {
  return (
    <header className={styles.nav}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.to === "/"}
          className={({ isActive }) => (isActive ? styles.active : undefined)}
        >
          {link.label}
        </NavLink>
      ))}
    </header>
  );
}
