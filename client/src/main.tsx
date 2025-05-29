import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set the document title and description for PWA
document.title = "Count Me Out - Mental Math Practice";
const metaDescription = document.querySelector('meta[name="description"]');
if (!metaDescription) {
  const meta = document.createElement('meta');
  meta.name = 'description';
  meta.content = 'Improve your mental math skills with Count Me Out - an offline-capable practice app for addition, subtraction, multiplication, division, and percentages.';
  document.head.appendChild(meta);
}

createRoot(document.getElementById("root")!).render(<App />);
