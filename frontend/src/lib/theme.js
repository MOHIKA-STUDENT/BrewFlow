// Tiny theme controller — no external state library needed for Sprint 1.
// Reads/writes a "dark" class on <html>, persists preference in memory
// (localStorage is intentionally avoided in the artifact preview context;
// in your real app this is a perfect spot for localStorage.getItem/setItem).

export function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}
