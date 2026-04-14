/**
 * JSON formatting and validation logic
 */

export function formatJson(jsonString: string, tabSize: number = 2): string {
    try {
        const obj = JSON.parse(jsonString);
        return JSON.stringify(obj, null, tabSize);
    } catch (error) {
        console.error(`Error`,error);
        throw new Error("Invalid JSON string");
    }
}

export function validateJson(jsonString: string): { isValid: boolean; error?: string } {
    try {
        JSON.parse(jsonString);
        return { isValid: true };
    } catch (error) {
        console.error(`Error`,error);
        return { isValid: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
}

export function minifyJson(jsonString: string): string {
    try {
        const obj = JSON.parse(jsonString);
        return JSON.stringify(obj);
    } catch (error : unknown) {
        console.error(`Error`,error);
        throw new Error("Invalid JSON string");
    }
}
