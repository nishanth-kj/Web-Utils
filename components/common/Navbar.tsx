import React from "react";
import { Button } from "@/components/ui/button";

function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        
        {/* Left section */}
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold leading-none">
            Web Utils
          </h1>
          <span className="text-xs text-muted-foreground">
            Developer utilities & converters
          </span>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <Button variant="ghost">Docs</Button>
          <Button variant="outline">GitHub</Button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;