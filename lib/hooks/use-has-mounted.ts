import { useSyncExternalStore } from "react";

function subscribe() {
    return () => {};
}

// Returns false during SSR and the initial client render, then true once
// mounted — the safe way to branch on client-only state (like next-themes'
// `theme`, which is undefined until after hydration) without a server/client
// hydration mismatch.
export function useHasMounted() {
    return useSyncExternalStore(subscribe, () => true, () => false);
}
