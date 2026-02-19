"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

export function AuthSync() {
  const subscribeToAuth = useAuthStore(s => s.subscribeToAuth);
  useEffect(() => {
    const unsubscribe = subscribeToAuth();
    return unsubscribe;
  }, [subscribeToAuth]);
  return null;
}
