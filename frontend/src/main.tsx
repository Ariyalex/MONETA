import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

// Placeholder: ganti dengan dashboard dari tim FE.
function App() {
  const [status, setStatus] = useState("memeriksa...");
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setStatus(JSON.stringify(d)))
      .catch(() => setStatus("backend tidak terjangkau"));
  }, []);
  return (
    <main style={{ fontFamily: "sans-serif", padding: 24 }}>
      <h1>MONETA</h1>
      <p>Status backend: {status}</p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
