import LandingHero from "../three/LandingHero.tsx";
import styles from "./Home.module.css";

export default function Home() {
  return (
    <div className={styles.world}>
      <LandingHero />
      <div className={styles.heroText}>
        <h1>Your Name</h1>
        <p>Your one-line pitch</p>
      </div>
    </div>
  );
}
