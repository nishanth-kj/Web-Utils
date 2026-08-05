/* tslint:disable */
/* eslint-disable */

export class BruteForceResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly password: string;
    checked: number;
    found: boolean;
}

export class StrengthResult {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly entropy: number;
    readonly time_string: string;
    readonly time_to_crack_seconds: number;
    readonly warnings: string;
}

export function brute_force_batch(target_hash_hex: string, algorithm: string, charset_str: string, start_idx: bigint, batch_size: number): BruteForceResult;

export function check_if_leaked(password: string, file_content: string): boolean;

export function check_password_strength(password: string, hashes_per_second: number): StrengthResult;

export function compute_hash(algo: string, text: string): string;

export function generate_passphrase(words_str: string, num_words: number, separator: string): string;

export function generate_password(length: number, use_upper: boolean, use_lower: boolean, use_numbers: boolean, use_symbols: boolean): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_bruteforceresult_free: (a: number, b: number) => void;
    readonly __wbg_get_bruteforceresult_checked: (a: number) => number;
    readonly __wbg_get_bruteforceresult_found: (a: number) => number;
    readonly __wbg_set_bruteforceresult_checked: (a: number, b: number) => void;
    readonly __wbg_set_bruteforceresult_found: (a: number, b: number) => void;
    readonly __wbg_strengthresult_free: (a: number, b: number) => void;
    readonly brute_force_batch: (a: number, b: number, c: number, d: number, e: number, f: number, g: bigint, h: number) => number;
    readonly bruteforceresult_password: (a: number) => [number, number];
    readonly check_if_leaked: (a: number, b: number, c: number, d: number) => number;
    readonly check_password_strength: (a: number, b: number, c: number) => number;
    readonly compute_hash: (a: number, b: number, c: number, d: number) => [number, number];
    readonly generate_passphrase: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly generate_password: (a: number, b: number, c: number, d: number, e: number) => [number, number];
    readonly strengthresult_entropy: (a: number) => number;
    readonly strengthresult_time_string: (a: number) => [number, number];
    readonly strengthresult_time_to_crack_seconds: (a: number) => number;
    readonly strengthresult_warnings: (a: number) => [number, number];
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
