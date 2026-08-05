"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWasmModule } from "@/lib/wasm-loader";
import { GeneratorTab } from "@/components/password/generator-tab";
import { CrackerTab } from "@/components/password/cracker-tab";

export default function PasswordPage() {
  const [dbContent, setDbContent] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await getWasmModule();
        // Load db
        const res = await fetch("/data/top-1m-passwords.txt");
        const text = await res.text();
        setDbContent(text);
        setIsReady(true);
      } catch (err) {
        console.error("Initialization failed:", err);
      }
    }
    init();
  }, []);

  return (
    <div className="absolute inset-0 overflow-y-auto bg-background text-foreground custom-scrollbar scroll-smooth">
      <div className="flex flex-col w-full min-h-full">
        {/* HEADER SECTION */}
        <div className="px-6 py-4 border-b border-border/50 shrink-0 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Advanced Password Tool</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate highly secure passwords, assess strength, and test resilience.</p>
        </div>

        <Tabs defaultValue="generator" className="w-full flex flex-col">
          <div className="px-6 pt-4 pb-2 flex justify-center max-w-4xl mx-auto w-full shrink-0">
            <TabsList className="grid w-[400px] grid-cols-2">
              <TabsTrigger value="generator">Generator & Analysis</TabsTrigger>
              <TabsTrigger value="cracker">Hash Cracker</TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full mt-2">
            {isReady ? (
              <>
                <GeneratorTab dbContent={dbContent} />
                <CrackerTab dbContent={dbContent} />
              </>
            ) : (
              <div className="p-12 text-center text-sm text-muted-foreground animate-pulse">
                Initializing engine and loading databases...
              </div>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}