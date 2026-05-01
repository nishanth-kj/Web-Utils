"use client";

import React from 'react';
import { MoreHorizontal, Save, FileDown, Share2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ActionMenuProps {
    handleDownload: () => void;
}

export function ActionMenu({ handleDownload }: ActionMenuProps) {
    return (
        <div className="relative z-50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm rounded-lg size-10">
                        <MoreHorizontal className="size-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1 rounded-xl shadow-2xl">
                    <DropdownMenuItem className="gap-2 h-10 rounded-lg cursor-pointer" onClick={handleDownload}>
                        <Save className="size-4" /> Save to...
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 h-10 rounded-lg cursor-pointer" onClick={handleDownload}>
                        <FileDown className="size-4" /> Export image... <span className="ml-auto text-[10px] text-muted-foreground">Ctrl+Shift+E</span>
                    </DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem className="gap-2 h-10 rounded-lg cursor-pointer">
                        <Share2 className="size-4" /> Live collaboration...
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 h-10 rounded-lg cursor-pointer">
                        <Settings className="size-4" /> Help & Settings
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
