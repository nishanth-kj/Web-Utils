let wasmModule: typeof import('../wasm/pkg/wasm.js') | null = null;
let initPromise: Promise<typeof import('../wasm/pkg/wasm.js')> | null = null;

export async function getWasmModule() {
  if (wasmModule) return wasmModule;
  
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const wasm = await import('../wasm/pkg/wasm.js');
        await wasm.default(); // Initialize the module
        return wasm;
      } catch (err) {
        console.error("Failed to initialize WASM module:", err);
        throw err;
      }
    })();
  }
  
  wasmModule = await initPromise;
  return wasmModule;
}
