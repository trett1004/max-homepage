import { Route, Routes } from "react-router-dom";
import Nav from "./components/Nav.tsx";
import Home from "./routes/Home.tsx";
import Projects from "./routes/Projects.tsx";
import Contact from "./routes/Contact.tsx";

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
}
