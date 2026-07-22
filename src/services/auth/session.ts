import { useContext } from "react";
import AuthContext from "./ctxAuth";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const EXPIRY_KEY = "session_expiry_ts";

export function useSession() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useSession must be used inside SessionProvider");
  return value;
}

export async function getSession(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem("session");
  } else {
    return await SecureStore.getItemAsync("session");
  }
}

export async function saveSession(token: string) {
  if (Platform.OS === "web") {
    localStorage.setItem("session", token);
  } else {
    await SecureStore.setItemAsync("session", token);
  }
}

export async function removeSession() {
  if (Platform.OS === "web") {
    localStorage.removeItem("session");
  } else {
    await SecureStore.deleteItemAsync("session");
  }
}

/* --- Expiry helpers --- */

export async function saveSessionExpiry(expiryTimestamp: number) {
  const value = String(expiryTimestamp);
  if (Platform.OS === "web") {
    localStorage.setItem(EXPIRY_KEY, value);
  } else {
    await SecureStore.setItemAsync(EXPIRY_KEY, value);
  }
}

export async function getSessionExpiry(): Promise<number | null> {
  let raw: string | null = null;
  if (Platform.OS === "web") {
    raw = localStorage.getItem(EXPIRY_KEY);
  } else {
    raw = await SecureStore.getItemAsync(EXPIRY_KEY);
  }
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function removeSessionExpiry() {
  if (Platform.OS === "web") {
    localStorage.removeItem(EXPIRY_KEY);
  } else {
    await SecureStore.deleteItemAsync(EXPIRY_KEY);
  }
}
