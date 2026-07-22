import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import nestApi from "../apis/nest/nest";
import { saveSessionExpiry } from "./session";

export async function registerUser(email: string, password: string) {
  const res = await nestApi.post("/auth/register", { email: email, password: password }, {
    validateStatus: () => true
  });

  const resOk = res.status >= 200 && res.status < 300;

  if (!resOk) {
    throw new Error("Credenciais inválidas");
  }

  return await res;
}

export async function signInFunction(email: string, password: string): Promise<string> {
  if (!email || !password) throw new Error("Preencha todos os campos");

  const res = await nestApi.post("/auth/login", { email: email, password: password }, {
    validateStatus: () => true
  });

  const resOk = res.status >= 200 && res.status < 300;

  if (!resOk) {
    throw new Error("Credenciais inválidas");
  }

  const data = await res.data;
  const token = data.access_token;

  if (Platform.OS === "web") {
    localStorage.setItem("session", token);
  } else {
    await SecureStore.setItemAsync("session", token);
  }

  if (data.expiry_timestamp) {
    try {
      await saveSessionExpiry(Number(data.expiry_timestamp));
    } catch (e) {
      console.warn("Não foi possível salvar expiry_timestamp:", e);
    }
  }

  return token;
}

export async function signOutFunction(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem("session");
    localStorage.removeItem("session_expiry_ts");
  } else {
    await SecureStore.deleteItemAsync("session");
    await SecureStore.deleteItemAsync("session_expiry_ts");
  }
}
