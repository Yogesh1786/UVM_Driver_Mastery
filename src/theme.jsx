import { createContext, useContext, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

const disableTransitions = () => {
  const css = document.createElement("style");
  css.appendChild(
    document.createTextNode(
      `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
    )
  );
  document.head.appendChild(css);

  return () => {
    // Force reflow so the style is applied synchronously
    (() => window.getComputedStyle(document.body))();

    // Re-enable transitions on the next frame so hover effects continue working
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (document.head.contains(css)) {
          document.head.removeChild(css);
        }
      });
    });
  };
};

const applyThemeToDOM = (newTheme) => {
  const enable = typeof document !== "undefined" ? disableTransitions() : () => {};
  const root = document.documentElement;
  if (newTheme === "light") {
    root.classList.add("light");
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
    document.body.classList.add("light");
    document.body.classList.remove("dark");
  } else {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
    document.body.classList.add("dark");
    document.body.classList.remove("light");
  }
  enable();
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("uvm-app-theme");
      const initial = saved === "light" || saved === "dark" ? saved : "dark";
      applyThemeToDOM(initial);
      return initial;
    } catch {
      applyThemeToDOM("dark");
      return "dark";
    }
  });

  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      localStorage.setItem("uvm-app-theme", theme);
    } catch (e) {
      console.warn("Unable to persist theme to localStorage", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    applyThemeToDOM(nextTheme);
    setTheme(nextTheme);
    try {
      localStorage.setItem("uvm-app-theme", nextTheme);
    } catch (e) {
      console.warn("Unable to persist theme to localStorage", e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer border select-none ${
        isDark
          ? "bg-slate-900/80 border-slate-800 text-amber-300 hover:bg-slate-800 hover:border-slate-700 shadow-sm"
          : "bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-300 shadow-sm"
      } ${className}`}
    >
      {isDark ? (
        <Moon size={18} className="fill-amber-300/20 text-amber-300" />
      ) : (
        <Sun size={18} className="fill-amber-500/20 text-amber-600" />
      )}
    </button>
  );
}

export default ThemeProvider;
