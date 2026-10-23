
"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("bycompany-theme");
    const initialTheme: Theme =
      savedTheme === "dark" ? "dark" : "light";

    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("bycompany-theme", nextTheme);
    setTheme(nextTheme);
  }

  return (
    <div className="theme-toggle-bar">
      <button
        type="button"
        className="theme-toggle-button"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        aria-pressed={theme === "dark"}
      >
        {theme === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
      </button>
    </div>
  );
}
