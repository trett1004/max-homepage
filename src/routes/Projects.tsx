import pageStyles from "../styles/page.module.css";
import styles from "./Projects.module.css";

const projects = [
  {
    title: "Project Title",
    blurb: "Short one- or two-sentence blurb about the project.",
    href: "#",
  },
  {
    title: "Project Title",
    blurb: "Short one- or two-sentence blurb about the project.",
    href: "#",
  },
  {
    title: "Project Title",
    blurb: "Short one- or two-sentence blurb about the project.",
    href: "#",
  },
];

export default function Projects() {
  return (
    <main className={pageStyles.pageContent}>
      <h1>Projects</h1>
      <div className={styles.projectGrid}>
        {projects.map((project, index) => (
          <article key={index} className={styles.projectCard}>
            <h2>{project.title}</h2>
            <p>{project.blurb}</p>
            <a href={project.href}>View project &rarr;</a>
          </article>
        ))}
      </div>
    </main>
  );
}
