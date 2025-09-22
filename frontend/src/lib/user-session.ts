const DEFAULT_USER_ID = "11111111-1111-1111-1111-111111111111";

function generateUserId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return DEFAULT_USER_ID;
}

function readFromStorage(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem("X_USER_ID") ?? undefined;
  } catch {
    return undefined;
  }
}

function writeToStorage(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("X_USER_ID", userId);
  } catch {
    // noop
  }
}

export function ensureUserId(): string {
  const override = import.meta.env.VITE_TEST_USER_ID as string | undefined;
  if (override) return override;

  if (typeof window === "undefined") {
    return DEFAULT_USER_ID;
  }

  const existing = readFromStorage();
  if (existing) return existing;

  const generated = generateUserId();
  writeToStorage(generated);
  return generated;
}

export function getActiveUserId(): string {
  if (typeof window === "undefined") {
    return (import.meta.env.VITE_TEST_USER_ID as string | undefined) ?? DEFAULT_USER_ID;
  }
  return ensureUserId();
}

export { DEFAULT_USER_ID };
