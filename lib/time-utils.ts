export function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const absDiff = Math.abs(diffMs);
    const isFuture = diffMs < 0;
    const prefix = isFuture ? "in " : "";
    const suffix = isFuture ? "" : " ago";

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${prefix}${seconds} second${seconds !== 1 ? "s" : ""}${suffix}`;
    if (minutes < 60) return `${prefix}${minutes} minute${minutes !== 1 ? "s" : ""}${suffix}`;
    if (hours < 24) return `${prefix}${hours} hour${hours !== 1 ? "s" : ""}${suffix}`;
    if (days < 30) return `${prefix}${days} day${days !== 1 ? "s" : ""}${suffix}`;
    if (months < 12) return `${prefix}${months} month${months !== 1 ? "s" : ""}${suffix}`;
    return `${prefix}${years} year${years !== 1 ? "s" : ""}${suffix}`;
}

export function getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

export function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function toLocalDatetimeString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const s = String(date.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${d}T${h}:${min}:${s}`;
}
