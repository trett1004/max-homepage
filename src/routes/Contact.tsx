import pageStyles from "../styles/page.module.css";
import styles from "./Contact.module.css";

export default function Contact() {
  return (
    <main className={pageStyles.pageContent}>
      <h1>Contact</h1>
      <ul className={styles.contactList}>
        <li>
          <a href="mailto:you@example.com">you@example.com</a>
        </li>
        <li>
          <a href="https://github.com/yourname">GitHub</a>
        </li>
        <li>
          <a href="https://linkedin.com/in/yourname">LinkedIn</a>
        </li>
      </ul>
    </main>
  );
}
