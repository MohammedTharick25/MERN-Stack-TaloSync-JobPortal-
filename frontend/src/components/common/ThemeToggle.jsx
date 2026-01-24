import { useEffect, useState } from "react";

const ThemeToggle = ({ showTextOnMobile = false }) => {
  const [dark, setDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      type="button"
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all
                 text-gray-600 dark:text-gray-400 
                 hover:bg-gray-100 dark:hover:bg-gray-700 
                 border border-transparent hover:border-gray-200 dark:hover:border-gray-600
                 ${!showTextOnMobile ? "justify-center sm:justify-start" : "justify-start"}`}
    >
      <span className="text-lg">{dark ? "☀️" : "🌙"}</span>

      {/* Logic to hide/show text based on the prop */}
      <span
        className={`text-sm font-medium ${showTextOnMobile ? "inline" : "hidden sm:inline"}`}
      >
        {dark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
};

export default ThemeToggle;
