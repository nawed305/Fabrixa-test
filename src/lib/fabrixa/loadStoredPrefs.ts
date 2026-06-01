export function loadStoredPrefs() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("fabrixa:prefs");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
