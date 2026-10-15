// Oscilloscope sample history: a fixed-size ring buffer per scope, filled
// once per simulation step, plus the scale helpers its screen uses.

export const SCOPE_DIVISIONS_X = 10;
export const SCOPE_DIVISIONS_Y = 8;
export const TIME_PER_DIV_OPTIONS = [0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1];
export const VOLTS_PER_DIV_OPTIONS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50];
export const DEFAULT_TIME_PER_DIV = 0.1;

export class ScopeBuffer {
    readonly capacity: number;
    private times: Float64Array;
    private channelA: Float32Array;
    private channelB: Float32Array;
    private head = 0;
    private count = 0;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.times = new Float64Array(capacity);
        this.channelA = new Float32Array(capacity);
        this.channelB = new Float32Array(capacity);
    }

    push(time: number, a: number, b: number) {
        this.times[this.head] = time;
        this.channelA[this.head] = a;
        this.channelB[this.head] = b;
        this.head = (this.head + 1) % this.capacity;
        this.count = Math.min(this.count + 1, this.capacity);
    }

    clear() {
        this.head = 0;
        this.count = 0;
    }

    get latest(): { time: number; a: number; b: number } | null {
        if (this.count === 0) return null;
        const i = (this.head - 1 + this.capacity) % this.capacity;
        return { time: this.times[i], a: this.channelA[i], b: this.channelB[i] };
    }

    /** Samples from the last `window` seconds, oldest first, thinned to at most `maxPoints`. */
    window(window: number, maxPoints: number): { time: number; a: number; b: number }[] {
        const latest = this.latest;
        if (!latest) return [];
        const start = latest.time - window;
        const samples: { time: number; a: number; b: number }[] = [];
        for (let k = this.count - 1; k >= 0; k--) {
            const i = (this.head - 1 - k + this.capacity * 2) % this.capacity;
            if (this.times[i] < start) continue;
            samples.push({ time: this.times[i], a: this.channelA[i], b: this.channelB[i] });
        }
        if (samples.length <= maxPoints) return samples;
        const stride = Math.ceil(samples.length / maxPoints);
        return samples.filter((_, i) => i % stride === 0 || i === samples.length - 1);
    }
}

/** Smallest volts/div that keeps `peak` within the screen's top and bottom halves. */
export function autoVoltsPerDiv(peak: number): number {
    const halfScreen = SCOPE_DIVISIONS_Y / 2 - 0.5;
    return VOLTS_PER_DIV_OPTIONS.find((option) => option * halfScreen >= Math.abs(peak)) ?? VOLTS_PER_DIV_OPTIONS[VOLTS_PER_DIV_OPTIONS.length - 1];
}
