"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { 
  ShieldAlert, ShieldCheck, Copy, Database, Cpu, 
  TerminalSquare, Hash, Check, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { getWasmModule } from "@/lib/wasm-loader";

const HASH_RATES = [
  { value: 100_000, label: "Old Smartphone (100 kH/s)" },
  { value: 1_000_000, label: "Modern Laptop (1 MH/s)" },
  { value: 1_000_000_000, label: "High-end GPU (1 GH/s)" },
  { value: 100_000_000_000, label: "Botnet / Mining Rig (100 GH/s)" }
];

export interface PasswordStrength {
  entropy: number;
  time_to_crack_seconds: number;
  time_string: string;
  warnings?: string[];
}

interface GeneratorTabProps {
  dbContent: string | null;
}

export function GeneratorTab({ dbContent }: GeneratorTabProps) {
  const [wasmModule, setWasmModule] = useState<any>(null);

  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [generateMode, setGenerateMode] = useState<"random" | "passphrase">("random");
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  
  const [numWords, setNumWords] = useState(4);
  const [separator, setSeparator] = useState("-");

  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [isLeaked, setIsLeaked] = useState<boolean | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [showHashes, setShowHashes] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [hashRate, setHashRate] = useState(HASH_RATES[0].value);
  const [isSimulating, setIsSimulating] = useState(false);

  const timeRef = useRef<HTMLDivElement>(null);
  const leakRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<HTMLDivElement>(null);

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

  // Generate New Password
  const handleGenerate = useCallback(() => {
    if (!wasmModule) return;

    let newPass = "";
    if (generateMode === "random") {
      if (!useUpper && !useLower && !useNumbers && !useSymbols) return;
      newPass = wasmModule.generate_password(length, useUpper, useLower, useNumbers, useSymbols);
    } else {
      if (dbContent) {
        newPass = wasmModule.generate_passphrase(dbContent, numWords, separator);
      } else {
        newPass = "waiting-for-dictionary...";
      }
    }
    setPassword(newPass);
  }, [wasmModule, length, useUpper, useLower, useNumbers, useSymbols, generateMode, numWords, separator, dbContent]);

  // Initial Generation
  useEffect(() => {
    if (wasmModule && !password && dbContent) {
      handleGenerate();
    }
  }, [wasmModule, dbContent, handleGenerate, password]);

  // Analyze Password
  useEffect(() => {
    if (!password || !wasmModule) return;

    async function analyze() {
      // 1. Strength
      const result = wasmModule.check_password_strength(password, hashRate);
      setStrength({
        entropy: result.entropy,
        time_to_crack_seconds: result.time_to_crack_seconds,
        time_string: result.time_string,
        warnings: result.warnings ? result.warnings.split("|").filter(Boolean) : []
      });

      // 2. Leak Check
      if (dbContent) {
        const leaked = wasmModule.check_if_leaked(password, dbContent);
        setIsLeaked(leaked);
      }

      // 3. Hashes
      const newHashes: Record<string, string> = {};
      const displayAlgos = ["MD5", "SHA-1", "SHA-224", "SHA-256", "SHA-384", "SHA-512", "SHA3-224", "SHA3-256", "SHA3-384", "SHA3-512", "RIPEMD-160", "BLAKE3"];
      for (const algo of displayAlgos) {
        newHashes[algo] = wasmModule.compute_hash(algo, password);
      }
      setHashes(newHashes);

      // Animate Updates
      if (timeRef.current) gsap.fromTo(timeRef.current, { scale: 0.95, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.3 });
      if (leakRef.current) gsap.fromTo(leakRef.current, { x: 10, opacity: 0.5 }, { x: 0, opacity: 1, duration: 0.3 });
    }

    analyze();
  }, [password, hashRate, dbContent, wasmModule]);

  const copyToClipboard = (text: string, field: string = "password") => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const getProgressColor = () => {
    if (!strength) return 'bg-red-500';
    if (strength.entropy < 40) return 'bg-red-500';
    if (strength.entropy < 70) return 'bg-yellow-500';
    return 'bg-emerald-500';
  }

  const getProgressValue = () => {
    if (!strength) return 0;
    return Math.min(100, Math.max(0, (strength.entropy / 100) * 100));
  }

  const startSimulation = () => {
    if (!password || !strength) return;
    setIsSimulating(true);
    let attempts = 0;
    let logs: string[] = [];

    if (simulationRef.current) {
      simulationRef.current.innerHTML = "Initializing Matrix Attack...";
    }

    const interval = setInterval(() => {
      if (simulationRef.current) {
        let r = "";
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
        for (let i = 0; i < password.length; i++) r += chars[Math.floor(Math.random() * chars.length)];

        attempts++;
        logs.push(`[${hashRate.toExponential(1)} H/s] ${r} -> <span style="color:#22c55e">FAILED</span>`);
        if (logs.length > 5) logs.shift();

        simulationRef.current.innerHTML = logs.join("<br/>");
      }
    }, 50);

    const timeToCrackMs = strength.time_to_crack_seconds * 1000;
    const crackTime = timeToCrackMs < 5000 ? timeToCrackMs : 5000;

    setTimeout(() => {
      clearInterval(interval);
      if (timeToCrackMs < 5000) {
        if (simulationRef.current) {
          logs.push(`[${hashRate.toExponential(1)} H/s] <span style="color: #10b981; font-weight: bold; font-size: 14px;">${password}</span> -> SUCCESS!`);
          logs.push(`<span style="color: #10b981">[SYSTEM] Cracked in ${(timeToCrackMs / 1000).toFixed(2)}s.</span>`);
          if (logs.length > 5) logs.shift();
          if (logs.length > 5) logs.shift();
          simulationRef.current.innerHTML = logs.join("<br/>");
        }
      } else {
        if (simulationRef.current) {
          logs.push(`<span style="color: #ef4444">[SYSTEM] Aborted. Estimated time: ${strength.time_string}</span>`);
          if (logs.length > 5) logs.shift();
          simulationRef.current.innerHTML = logs.join("<br/>");
        }
      }

      setTimeout(() => setIsSimulating(false), 6000);
    }, crackTime);
  }

  return (
    <TabsContent value="generator" className="m-0">
      <div className="w-full max-w-4xl mx-auto px-6 py-6">
        <div className="flex flex-col gap-6 pb-20">

          {/* TOP PANEL: Generator & Hashes */}
          <div className="w-full">
            <div className="space-y-4">
              <div className="bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm">
                <div className="p-5 border-b bg-muted/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Zap className="size-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg leading-tight tracking-tight">Secure Generator</h2>
                      <p className="text-xs text-muted-foreground">Rust-powered secure randomness</p>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-6">
                  {/* Password Display */}
                  <div className="relative group">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Type a password..."
                      className="w-full h-16 bg-muted/30 border border-muted/50 rounded-xl px-4 text-center font-mono text-2xl tracking-wider text-foreground outline-none focus:border-primary/50 transition-colors shadow-inner"
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                      <button
                        onClick={handleGenerate}
                        className="size-10 flex items-center justify-center rounded-lg bg-background border shadow-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Generate New"
                      >
                        <Zap className="size-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(password)}
                        className="size-10 flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
                      >
                        {copied === "password" ? <Check className="size-4" /> : <Copy className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Mode Toggle */}
                  <div className="flex bg-muted p-1 rounded-lg w-fit mx-auto">
                    <button
                      onClick={() => setGenerateMode("random")}
                      className={cn("text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md transition-all", generateMode === "random" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                    >
                      Random
                    </button>
                    <button
                      onClick={() => setGenerateMode("passphrase")}
                      className={cn("text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md transition-all", generateMode === "passphrase" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
                    >
                      Passphrase
                    </button>
                  </div>

                  {/* Settings */}
                  {generateMode === "random" ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Length</Label>
                          <span className="text-xs font-mono font-bold">{length}</span>
                        </div>
                        <Slider
                          value={[length]}
                          onValueChange={([v]) => setLength(v)}
                          min={8}
                          max={128}
                          step={1}
                          className="py-1"
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <Checkbox checked={useUpper} onCheckedChange={(c) => setUseUpper(c as boolean)} className="scale-75 data-[state=checked]:bg-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors select-none">Uppercase</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <Checkbox checked={useLower} onCheckedChange={(c) => setUseLower(c as boolean)} className="scale-75 data-[state=checked]:bg-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors select-none">Lowercase</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <Checkbox checked={useNumbers} onCheckedChange={(c) => setUseNumbers(c as boolean)} className="scale-75 data-[state=checked]:bg-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors select-none">Numbers</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer group">
                          <Checkbox checked={useSymbols} onCheckedChange={(c) => setUseSymbols(c as boolean)} className="scale-75 data-[state=checked]:bg-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors select-none">Symbols</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Word Count</Label>
                          <span className="text-xs font-mono font-bold">{numWords}</span>
                        </div>
                        <Slider
                          value={[numWords]}
                          onValueChange={([v]) => setNumWords(v)}
                          min={3}
                          max={12}
                          step={1}
                          className="py-1"
                        />
                      </div>
                      <div className="space-y-3 pt-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Separator</Label>
                        <div className="flex gap-2">
                          {["-", "_", ".", " ", ","].map(sep => (
                            <button
                              key={sep}
                              onClick={() => setSeparator(sep)}
                              className={cn(
                                "size-10 flex items-center justify-center rounded-lg border shadow-sm transition-all font-mono text-lg",
                                separator === sep ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {sep === " " ? "SPC" : sep}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* STRENGTH ANALYSIS */}
              <div className="bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm">
                <div className="p-5 border-b bg-muted/5 flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <Cpu className="size-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg leading-tight tracking-tight">Strength Analysis</h2>
                    <p className="text-xs text-muted-foreground">Advanced entropy and leak checks</p>
                  </div>
                </div>

                <div className="p-5 space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Information Entropy</span>
                    <span className="font-mono font-bold text-lg">
                      {strength?.entropy.toFixed(1) || 0} bits
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full transition-all duration-700 ease-out ${getProgressColor()}`}
                      style={{ width: `${getProgressValue()}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div ref={timeRef} className="flex items-center gap-4 p-4 bg-background border border-muted/40 rounded-xl shadow-sm">
                      <div className={`p-2.5 rounded-lg shrink-0 ${strength?.entropy && strength.entropy > 60 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {strength?.entropy && strength.entropy > 60 ? (
                          <ShieldCheck className="size-5 text-emerald-500" />
                        ) : (
                          <ShieldAlert className="size-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Time to crack</span>
                        <span className="text-sm font-mono font-bold text-foreground truncate" title={strength?.time_string}>
                          {strength?.time_string || '...'}
                        </span>
                      </div>
                    </div>

                    <div ref={leakRef} className={`flex items-center gap-4 p-4 rounded-xl shadow-sm border transition-colors ${isLeaked ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/20'
                      }`}>
                      <div className={`p-2.5 rounded-lg shrink-0 ${isLeaked ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                        <Database className={`size-5 ${isLeaked ? 'text-red-500' : 'text-emerald-500'}`} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Database Leak Check</span>
                        <span className={`text-xs font-bold truncate ${isLeaked ? 'text-red-500' : 'text-emerald-500'}`}>
                          {isLeaked === null ? 'Checking...' : isLeaked ? 'Compromised!' : 'Safe (Not Found)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hardware Attacker Selector */}
                  <div className="space-y-3 p-4 border border-muted/30 rounded-xl bg-muted/5 mt-4">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Simulated Attacker Hardware</Label>
                    <Select
                      value={hashRate.toString()}
                      onValueChange={(val) => setHashRate(Number(val))}
                    >
                      <SelectTrigger className="w-full h-9 bg-background shadow-sm text-sm">
                        <SelectValue placeholder="Select hardware" />
                      </SelectTrigger>
                      <SelectContent className="w-[var(--radix-select-trigger-width)]">
                        {HASH_RATES.map((rate, i) => (
                          <SelectItem key={i} value={rate.value.toString()}>{rate.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Live Brute Force Simulator */}
                  <div className="pt-2">
                    {!isSimulating ? (
                      <Button
                        variant="outline"
                        className="w-full h-10 border-dashed border-muted/50 hover:border-primary/50 text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors bg-primary/5"
                        onClick={startSimulation}
                        disabled={!password || !strength}
                      >
                        <TerminalSquare className="size-3 mr-2" />
                        Simulate Matrix Attack
                      </Button>
                    ) : (
                      <div className="w-full bg-[#0a0a0a] rounded-lg border border-[#33ff33]/30 p-3 h-32 overflow-hidden shadow-inner flex flex-col relative">
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-20" />
                        <div className="flex items-center gap-2 mb-2 border-b border-[#33ff33]/20 pb-2 shrink-0 z-20">
                          <div className="size-2 rounded-full bg-[#33ff33] animate-pulse shadow-[0_0_8px_#33ff33]" />
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#33ff33]">Matrix Attack in Progress</span>
                        </div>
                        <div
                          ref={simulationRef}
                          className="text-[10px] sm:text-xs font-mono text-[#33ff33]/70 leading-relaxed overflow-hidden z-20 whitespace-nowrap"
                        >
                          Initializing attack...
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Hashes Section */}
                {password && (
                  <div className="space-y-3 pt-4 border-t border-muted/30 mt-4 px-5 pb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="size-3 text-muted-foreground" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Generated Hashes</span>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(hashes).map(([algo, hash]) => (
                        <div key={algo} className="flex items-center justify-between text-[10px] px-3 py-2 rounded-md bg-muted/10 border border-muted/30 group">
                          <span className="text-muted-foreground w-14 shrink-0 font-bold">{algo}</span>
                          <span className="font-mono text-[9px] sm:text-[10px] text-foreground truncate flex-1 px-2 select-all">{hash}</span>
                          <button onClick={() => copyToClipboard(hash, algo)} className="hover:text-primary transition-colors text-muted-foreground">
                            {copied === algo ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
