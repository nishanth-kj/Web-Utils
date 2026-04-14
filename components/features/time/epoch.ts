/**
 * Epoch and Date conversion logic
 */

export function epochToDate(epoch: number): Date {
    // Detect if seconds or milliseconds
    const ms = epoch < 10000000000 ? epoch * 1000 : epoch;
    return new Date(ms);
}

export function dateToEpoch(date: Date, unit: 's' | 'ms' = 's'): number {
    const ms = date.getTime();
    return unit === 's' ? Math.floor(ms / 1000) : ms;
}

export function formatRelative(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return "just now";
}

export function isValidEpoch(val: unknown): boolean {
    const num = Number(val);
    return !isNaN(num) && num > 0;
}
