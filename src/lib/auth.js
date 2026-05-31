const AUTH_KEY = "rateyourarea_user";

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("rateyourarea-auth-update"));
  return user;
}

export function clearUser() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("rateyourarea-auth-update"));
}

export function loginUser({ email, name = "Resident" }) {
  return saveUser({
    id: `user-${Date.now()}`,
    email: email.trim(),
    name: name.trim() || email.split("@")[0],
    loggedInAt: new Date().toISOString(),
  });
}

export function logoutUser() {
  clearUser();
}
