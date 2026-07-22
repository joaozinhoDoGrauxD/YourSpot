import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSession, getSessionExpiry } from "@/services/auth/session";
import { getSessionExpiry as getExpiryHelper } from "@/services/auth/session";

export default function IndexRedirect() {
  const { session, signOut, isLoading } = useSession();
  const router = useRouter();
  const expiryTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function setupExpiryWatcher() {
      // clear previous timeout
      if (expiryTimeoutRef.current) {
        clearTimeout(expiryTimeoutRef.current);
        expiryTimeoutRef.current = null;
      }

      const expiryTs = await getExpiryHelper();
      if (!expiryTs) return;

      const now = Date.now();
      const msLeft = expiryTs - now;

      if (msLeft <= 0) {
        // already expired
        await signOut();
        if (mounted) router.replace("/(auth)/login");
        return;
      }

      // schedule signOut when token expires
      expiryTimeoutRef.current = setTimeout(async () => {
        await signOut();
        router.replace("/(auth)/login");
      }, msLeft) as unknown as number;
    }

    // If user is logged in, redirect to My Reports and start expiry watcher
    if (session) {
      // redirect to my-reports inside tabs/drawer
      router.replace("/(drawer)/(tabs)/my-reports");
      setupExpiryWatcher();
    }

    return () => {
      mounted = false;
      if (expiryTimeoutRef.current) {
        clearTimeout(expiryTimeoutRef.current);
        expiryTimeoutRef.current = null;
      }
    };
  }, [session, signOut, router]);

  // While session is being resolved or redirecting, show a loader
  if (isLoading) {
    return (
      <View className="flex-1 bg-[#F9F9F6] justify-center items-center">
        <ActivityIndicator size="large" color="#1C1C1E" />
      </View>
    );
  }

  // If no session, render the normal home entry point (or let router handle it)
  return (
    <View className="flex-1 bg-[#F9F9F6] justify-center items-center">
      <ActivityIndicator size="large" color="#1C1C1E" />
    </View>
  );
}
