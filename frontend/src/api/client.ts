import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

const TOKEN_KEY = "@getfit_jwt";
const SESSION_KEY = "@getfit_session_token";

// -------- Token storage --------
export async function setToken(token: string | null) {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}
export async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}
export async function setSessionToken(token: string | null) {
  if (token) await AsyncStorage.setItem(SESSION_KEY, token);
  else await AsyncStorage.removeItem(SESSION_KEY);
}
export async function getSessionToken() {
  return await AsyncStorage.getItem(SESSION_KEY);
}

// -------- Fetch wrapper --------
type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  auth?: boolean;
};

export async function api<T = any>(
  path: string,
  opts: Options = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.auth !== false) {
    const jwt = await getToken();
    if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
    const sess = await getSessionToken();
    if (sess) headers["X-Session-Token"] = sess;
  }
  const res = await fetch(`${BACKEND_URL}/api${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: Platform.OS === "web" ? "include" : "omit",
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    const msg = typeof detail === "string" ? detail : JSON.stringify(detail);
    throw new Error(msg);
  }
  return data as T;
}

export const API_BASE = BACKEND_URL;
