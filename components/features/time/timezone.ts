/**
 * Timezone conversion logic
 */

export function convertTimezone(date: Date, toTz: string): string {
    return date.toLocaleString('en-US', { timeZone: toTz });
}

export const COMMON_TIMEZONES = [
    { label: "UTC", value: "UTC" },
    { label: "India (IST)", value: "Asia/Kolkata" },
    { label: "New York (EST/EDT)", value: "America/New_York" },
    { label: "London (GMT/BST)", value: "Europe/London" },
    { label: "Tokyo (JST)", value: "Asia/Tokyo" },
    { label: "Pacific (PST/PDT)", value: "America/Los_Angeles" }
];

export function getSystemTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
