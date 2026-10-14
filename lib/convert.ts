import yaml from "js-yaml";
import { csvToRecords, stringifyCsv } from "@/lib/csv";
import { parseMultipleJson } from "@/lib/json-parser";
import type { Format } from "@/types";

export interface Conversion {
    to: Format;
    label: string;
    convert: (content: string) => string;
}

export function jsonToYaml(content: string): string {
    return parseMultipleJson(content).map((doc) => yaml.dump(doc)).join("---\n");
}

export function yamlToJson(content: string): string {
    return yaml.loadAll(content).map((doc) => JSON.stringify(doc, null, 2)).join("\n\n");
}

export function csvToJson(content: string): string {
    return JSON.stringify(csvToRecords(content), null, 2);
}

function cellValue(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

export function jsonToCsv(content: string): string {
    const parsed: unknown = JSON.parse(content);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    if (rows.length === 0 || !rows.every((row) => row !== null && typeof row === "object" && !Array.isArray(row))) {
        throw new Error("CSV needs a JSON object or an array of objects, one per row.");
    }

    // Objects don't always share keys; take every column in first-seen order.
    const headers = [...new Set(rows.flatMap((row) => Object.keys(row as object)))];
    return stringifyCsv([
        headers,
        ...rows.map((row) => headers.map((header) => cellValue((row as Record<string, unknown>)[header]))),
    ]);
}

export const CONVERSIONS: Partial<Record<Format, Conversion[]>> = {
    json: [
        { to: "yaml", label: "JSON to YAML", convert: jsonToYaml },
        { to: "csv", label: "JSON to CSV", convert: jsonToCsv },
    ],
    yaml: [{ to: "json", label: "YAML to JSON", convert: yamlToJson }],
    csv: [{ to: "json", label: "CSV to JSON", convert: csvToJson }],
};
