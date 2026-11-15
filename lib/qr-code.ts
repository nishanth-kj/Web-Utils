"use strict";

const DATA_CODEWORDS = [0, 19, 34, 55, 80, 108];
const ECC_CODEWORDS = [0, 7, 10, 15, 20, 26];
const ALIGNMENT_CENTERS: Record<number, number[]> = {
    2: [6, 18],
    3: [6, 22],
    4: [6, 26],
    5: [6, 30],
};

function multiply(a: number, b: number): number {
    let result = 0;
    while (b > 0) {
        if (b & 1) result ^= a;
        a <<= 1;
        if (a & 0x100) a ^= 0x11d;
        b >>>= 1;
    }
    return result;
}

function reedSolomon(data: number[], degree: number): number[] {
    let generator = [1];
    let root = 1;
    for (let i = 0; i < degree; i++) {
        const next = new Array(generator.length + 1).fill(0);
        for (let j = 0; j < generator.length; j++) {
            next[j] ^= generator[j];
            next[j + 1] ^= multiply(generator[j], root);
        }
        generator = next;
        root = multiply(root, 2);
    }

    const remainder = new Array(degree).fill(0);
    for (const byte of data) {
        const factor = byte ^ remainder.shift()!;
        remainder.push(0);
        for (let i = 0; i < degree; i++) remainder[i] ^= multiply(generator[i + 1], factor);
    }
    return remainder;
}

function appendBits(bits: number[], value: number, length: number): void {
    for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

function makeCodewords(bytes: Uint8Array, version: number): number[] {
    const capacity = DATA_CODEWORDS[version] * 8;
    const bits: number[] = [];
    appendBits(bits, 0b0100, 4);
    appendBits(bits, bytes.length, 8);
    for (const byte of bytes) appendBits(bits, byte, 8);
    appendBits(bits, 0, Math.min(4, capacity - bits.length));
    while (bits.length % 8 !== 0) bits.push(0);

    const data: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
        data.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0));
    }
    for (let pad = 0xec; data.length < DATA_CODEWORDS[version]; pad ^= 0xec ^ 0x11) data.push(pad);
    return [...data, ...reedSolomon(data, ECC_CODEWORDS[version])];
}

function formatBits(mask: number): number {
    const data = (0b01 << 3) | mask; // Error correction level L
    let remainder = data << 10;
    for (let bit = 14; bit >= 10; bit--) {
        if ((remainder >>> bit) & 1) remainder ^= 0x537 << (bit - 10);
    }
    return ((data << 10) | remainder) ^ 0x5412;
}

export function generateQrMatrix(value: string): boolean[][] {
    const bytes = new TextEncoder().encode(value);
    if (bytes.length === 0) throw new Error("Enter some text to generate a QR code.");
    const version = DATA_CODEWORDS.findIndex((capacity, index) => index > 0 && bytes.length <= capacity - 2);
    if (version < 1 || version > 5) {
        throw new Error("This QR generator supports up to 106 UTF-8 bytes. Shorten the content to continue.");
    }

    const size = 17 + version * 4;
    const matrix = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
    const reserved = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
    const setFunction = (x: number, y: number, dark: boolean) => {
        if (x >= 0 && y >= 0 && x < size && y < size) {
            matrix[y][x] = dark;
            reserved[y][x] = true;
        }
    };

    const drawFinder = (left: number, top: number) => {
        for (let dy = -1; dy <= 7; dy++) {
            for (let dx = -1; dx <= 7; dx++) {
                const x = left + dx;
                const y = top + dy;
                const inside = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
                const dark = inside && (
                    dx === 0 || dx === 6 || dy === 0 || dy === 6 ||
                    (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
                );
                setFunction(x, y, dark);
            }
        }
    };

    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    for (let i = 8; i < size - 8; i++) {
        setFunction(i, 6, i % 2 === 0);
        setFunction(6, i, i % 2 === 0);
    }

    const centers = ALIGNMENT_CENTERS[version] ?? [];
    for (const cy of centers) {
        for (const cx of centers) {
            if (reserved[cy][cx]) continue;
            for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                    const distance = Math.max(Math.abs(dx), Math.abs(dy));
                    setFunction(cx + dx, cy + dy, distance !== 1);
                }
            }
        }
    }

    // Reserve both format-information areas and the fixed dark module.
    for (let i = 0; i <= 5; i++) setFunction(8, i, false);
    setFunction(8, 7, false);
    setFunction(8, 8, false);
    setFunction(7, 8, false);
    for (let i = 9; i < 15; i++) setFunction(14 - i, 8, false);
    for (let i = 0; i < 8; i++) setFunction(size - 1 - i, 8, false);
    for (let i = 8; i < 15; i++) setFunction(8, size - 15 + i, false);
    setFunction(8, size - 8, true);

    const codewords = makeCodewords(bytes, version);
    const dataBits = codewords.flatMap((byte) =>
        Array.from({ length: 8 }, (_, bit) => (byte >>> (7 - bit)) & 1)
    );
    let bitIndex = 0;
    let upward = true;
    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < size; vert++) {
            const y = upward ? size - 1 - vert : vert;
            for (let offset = 0; offset < 2; offset++) {
                const x = right - offset;
                if (reserved[y][x]) continue;
                const bit = dataBits[bitIndex++] ?? 0;
                matrix[y][x] = Boolean(bit ^ (((x + y) % 2 === 0) ? 1 : 0));
            }
        }
        upward = !upward;
    }

    const format = formatBits(0);
    for (let i = 0; i <= 5; i++) matrix[i][8] = Boolean((format >>> i) & 1);
    matrix[7][8] = Boolean((format >>> 6) & 1);
    matrix[8][8] = Boolean((format >>> 7) & 1);
    matrix[8][7] = Boolean((format >>> 8) & 1);
    for (let i = 9; i < 15; i++) matrix[8][14 - i] = Boolean((format >>> i) & 1);
    for (let i = 0; i < 8; i++) matrix[8][size - 1 - i] = Boolean((format >>> i) & 1);
    for (let i = 8; i < 15; i++) matrix[size - 15 + i][8] = Boolean((format >>> i) & 1);
    matrix[size - 8][8] = true;

    return matrix;
}

export function qrMatrixToSvg(matrix: boolean[][], foreground = "#000000", background = "#ffffff"): string {
    const size = matrix.length;
    const modules: string[] = [];
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (matrix[y][x]) modules.push(`M${x + 4} ${y + 4}h1v1h-1z`);
        }
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size + 8}" height="${size + 8}" viewBox="0 0 ${size + 8} ${size + 8}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${background}"/><path d="${modules.join("")}" fill="${foreground}"/></svg>`;
}
