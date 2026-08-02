"use client";

import { useState, useRef, useEffect } from "react";
import { Unlock, UploadCloud, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getWasmModule } from "@/lib/wasm-loader";
const HASH_ALGORITHMS = ["MD5", "SHA-1", "SHA-224", "SHA-256", "SHA-384", "SHA-512", "SHA3-224", "SHA3-256", "SHA3-384", "SHA3-512", "RIPEMD-160", "BLAKE3"];

interface CrackerTabProps {
  dbContent: string | null;
}

function indexToPassword(idx: bigint, charset: string): string {
  const base = BigInt(charset.length);
  let length = 1;
  let maxForLength = base;
  let i = idx;

  while (i >= maxForLength) {
    i -= maxForLength;
    length += 1;
    maxForLength *= base;
  }

  let result = "";
  for (let j = 0; j < length; j++) {
    const remainder = Number(i % base);
    result += charset[remainder];
    i /= base;
  }
  return result.split("").reverse().join("");
}

export function CrackerTab({ dbContent }: CrackerTabProps) {
  const [wasmModule, setWasmModule] = useState<any>(null);

  const [crackMode, setCrackMode] = useState<"dictionary" | "bruteforce">("dictionary");
  const [targetHash, setTargetHash] = useState("");
  const [crackAlgo, setCrackAlgo] = useState(HASH_ALGORITHMS[0]);
  const [bruteCharset, setBruteCharset] = useState("abcdefghijklmnopqrstuvwxyz0123456789");
  
  const [crackResult, setCrackResult] = useState<string | null>(null);
  const [crackProgress, setCrackProgress] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState<string>("");
  const [isCracking, setIsCracking] = useState(false);
  const crackRef = useRef<boolean>(false);
  
  const [customDictionary, setCustomDictionary] = useState<string | null>(null);
  const [customDictName, setCustomDictName] = useState<string | null>(null);

  // Initialize WASM
  useEffect(() => {
    async function init() {
      try {
        const mod = await getWasmModule();
        setWasmModule(mod);
      } catch (err) {
        console.error("WASM Init error:", err);
      }
    }
    init();
  }, []);

  const handleDictUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomDictName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setCustomDictionary(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleCrack = async () => {
    if (!targetHash || !wasmModule) return;
    setIsCracking(true);
    crackRef.current = true;
    setCrackResult(null);
    setCrackProgress(0);
    setCurrentAttempt("");

    const targetClean = targetHash.trim().toLowerCase();
    
    // Ensure the hash is valid hex
    if (!/^[0-9a-f]+$/.test(targetClean)) {
      setCrackResult("Error: Hash must be a valid hexadecimal string.");
      setIsCracking(false);
      return;
    }

    if (crackMode === "dictionary") {
      const dictToUse = customDictionary || dbContent;
      if (!dictToUse) return;
      const words = dictToUse.split("\n").map(w => w.trim()).filter(Boolean);
      const total = words.length;
      const batchSize = 1000;

      for (let i = 0; i < total; i += batchSize) {
        if (!crackRef.current) break;

        const batch = words.slice(i, i + batchSize);

        for (let j = 0; j < batch.length; j++) {
          const h = wasmModule.compute_hash(crackAlgo, batch[j]).toLowerCase();
          if (h === targetClean) {
            setCrackResult(batch[j]);
            setIsCracking(false);
            setCrackProgress(100);
            return;
          }
        }

        setCrackProgress(Math.floor((i / total) * 100));
        setCurrentAttempt(batch[batch.length - 1]);
        await new Promise(r => setTimeout(r, 0)); // Yield to UI
      }
    } else {
      // Brute Force Mode
      const batchSize = 100_000;
      let currentIdx = BigInt(0);
      const limit = BigInt(1_000_000_000); // 1 Billion limit for demo purposes

      while (crackRef.current && currentIdx < limit) {
        const res = wasmModule.brute_force_batch(targetClean, crackAlgo, bruteCharset, currentIdx, batchSize);

        if (res.found) {
          setCrackResult(res.password);
          setIsCracking(false);
          setCrackProgress(100);
          return;
        }

        currentIdx += BigInt(batchSize);
        setCrackProgress(Math.floor(Number(currentIdx) / Number(limit) * 100));
        setCurrentAttempt(indexToPassword(currentIdx, bruteCharset));
        await new Promise(r => setTimeout(r, 0));
      }
    }

    if (crackRef.current) {
      setCrackResult("NOT_FOUND");
    }
    setIsCracking(false);
  };

  const stopCracking = () => {
    crackRef.current = false;
    setIsCracking(false);
  };

  return (
    <TabsContent value="cracker" className="m-0 p-6">
      <div className="max-w-3xl mx-auto w-full mt-4 space-y-6">
        <div className="text-center space-y-2 mb-8">
          <div className="mx-auto size-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
            <Unlock className="size-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Offline Hash Cracker</h2>
          <p className="text-sm text-muted-foreground">Perform a dictionary attack using our local 10,000-word password database, or upload your own.</p>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex bg-muted/50 p-1 rounded-lg w-fit mx-auto mb-6">
            <button
              onClick={() => setCrackMode("dictionary")}
              className={cn("text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md transition-all", crackMode === "dictionary" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
              Dictionary Attack
            </button>
            <button
              onClick={() => setCrackMode("bruteforce")}
              className={cn("text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md transition-all", crackMode === "bruteforce" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
              Brute Force
            </button>
          </div>

          <div className="space-y-4">
            {crackMode === "dictionary" && (
              <div className="space-y-2 border border-dashed border-muted-foreground/30 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-muted/5">
                <input type="file" accept=".txt" onChange={handleDictUpload} className="hidden" id="dict-upload" />
                <Label htmlFor="dict-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <UploadCloud className="size-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground hover:underline">Upload Custom Dictionary</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {customDictName ? `Loaded: ${customDictName}` : "Supports any .txt wordlist"}
                    </p>
                  </div>
                </Label>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Hash</Label>
              <input
                type="text"
                value={targetHash}
                onChange={(e) => setTargetHash(e.target.value)}
                placeholder="Paste any supported hash here..."
                className="w-full h-10 px-3 rounded-lg bg-background border border-muted/50 focus:border-primary/50 outline-none transition-all text-sm font-mono shadow-sm"
                disabled={isCracking}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hash Algorithm</Label>
              <Select
                value={crackAlgo}
                onValueChange={(val) => setCrackAlgo(val as any)}
                disabled={isCracking}
              >
                <SelectTrigger className="w-full h-10 bg-background shadow-sm text-sm overflow-hidden">
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent className="w-[var(--radix-select-trigger-width)]">
                  {HASH_ALGORITHMS.map(algo => (
                    <SelectItem key={algo} value={algo}>{algo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {crackMode === "bruteforce" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Charset</Label>
                <input
                  type="text"
                  value={bruteCharset}
                  onChange={(e) => setBruteCharset(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-background border border-muted/50 focus:border-primary/50 outline-none transition-all text-sm font-mono shadow-sm"
                  disabled={isCracking}
                />
                <p className="text-[10px] text-muted-foreground">Limited to ~10 million guesses for browser demonstration.</p>
              </div>
            )}
          </div>

          <div className="pt-2">
            {!isCracking ? (
              <Button
                variant="default"
                size="lg"
                className="w-full font-bold"
                onClick={handleCrack}
                disabled={!targetHash || (crackMode === "dictionary" && !dbContent)}
              >
                <Zap className="size-4 mr-2" />
                Start {crackMode === "dictionary" ? "Dictionary" : "Brute Force"} Attack
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="lg"
                className="w-full font-bold"
                onClick={stopCracking}
              >
                Stop Attack
              </Button>
            )}
          </div>

          {isCracking && (
            <div className="space-y-2 pt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Cracking in progress...</span>
                <span className="font-mono">{crackProgress}%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${crackProgress}%` }}
                />
              </div>
              <div className="flex items-center gap-2 mt-2 px-1 text-xs text-muted-foreground font-mono truncate">
                <span className="font-bold uppercase tracking-widest text-[10px]">Testing:</span>
                <span className="truncate">{currentAttempt}</span>
              </div>
            </div>
          )}

          {crackResult && (
            <div className={cn(
              "mt-6 p-4 rounded-xl border flex items-center justify-center animate-in zoom-in-95 duration-300",
              crackResult === "NOT_FOUND"
                ? "bg-red-500/10 border-red-500/20 text-red-500"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
            )}>
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">
                  {crackResult === "NOT_FOUND" ? "Result" : "Password Cracked!"}
                </p>
                <p className={cn(
                  "font-mono text-xl",
                  crackResult === "NOT_FOUND" ? "font-medium" : "font-bold select-all"
                )}>
                  {crackResult === "NOT_FOUND" ? "Not found in 10k dictionary." : crackResult}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
}
