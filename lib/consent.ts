export type ConsentValue = "accepted" | "declined";

const STORAGE_KEY = "cookie-consent";
export const CONSENT_CHANGE_EVENT = "cookie-consent-changed";

export function getStoredConsent(): ConsentValue | null {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : null;
}

export function setStoredConsent(value: ConsentValue) {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(new CustomEvent<ConsentValue>(CONSENT_CHANGE_EVENT, { detail: value }));
}

// Reopens the banner so the visitor can change an earlier decision.
export function clearStoredConsent() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent<null>(CONSENT_CHANGE_EVENT, { detail: null }));
}
