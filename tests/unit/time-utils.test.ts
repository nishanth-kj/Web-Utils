import { afterEach, describe, expect, it, vi } from "vitest";
import { formatRelativeTime, getDayOfYear, getWeekNumber, toLocalDatetimeString } from "@/lib/time-utils";

describe("getDayOfYear", () => {
    it("counts January 1 as day 1 and December 31 of a leap year as day 366", () => {
        expect(getDayOfYear(new Date(2024, 0, 1))).toBe(1);
        expect(getDayOfYear(new Date(2024, 11, 31))).toBe(366);
    });

    it("is correct for every day of the year, including across DST changes", () => {
        for (let day = 1; day <= 365; day++) {
            expect(getDayOfYear(new Date(2025, 0, day))).toBe(day);
        }
    });
});

describe("getWeekNumber", () => {
    it.each([
        [new Date(2021, 0, 1), 53],
        [new Date(2021, 0, 4), 1],
        [new Date(2024, 11, 30), 1],
        [new Date(2025, 5, 15), 24],
    ])("returns the ISO week of %s", (date, week) => {
        expect(getWeekNumber(date)).toBe(week);
    });
});

describe("toLocalDatetimeString", () => {
    it("formats a date for datetime-local inputs", () => {
        expect(toLocalDatetimeString(new Date(2025, 2, 9, 4, 5, 6))).toBe("2025-03-09T04:05:06");
    });
});

describe("formatRelativeTime", () => {
    afterEach(() => vi.useRealTimers());

    it("describes past and future offsets", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2025-06-15T12:00:00Z"));

        expect(formatRelativeTime(new Date("2025-06-15T11:59:59Z"))).toBe("1 second ago");
        expect(formatRelativeTime(new Date("2025-06-15T09:00:00Z"))).toBe("3 hours ago");
        expect(formatRelativeTime(new Date("2025-06-17T12:00:00Z"))).toBe("in 2 days");
        expect(formatRelativeTime(new Date("2023-06-15T12:00:00Z"))).toBe("2 years ago");
    });
});
