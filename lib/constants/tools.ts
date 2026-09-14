import {
    Clock,
    Database,
    FileCode,
    type LucideIcon,
    Shield,
    PenTool,
    FilePlus,
    Eye,
    Key,
    Clapperboard,
    Bug
} from 'lucide-react';
import { PREVIEWABLE_FORMATS } from '@/lib/formats';

export interface ToolSubOption {
    name: string;
    href: string;
}

export interface Tool {
    id: string;
    name: string;
    description: string;
    href: string;
    category: string;
    status: 'Available' | 'Coming Soon' | 'Beta';
    icon: LucideIcon;
    subOptions?: ToolSubOption[];
    isNew?: boolean;
}

export interface Category {
    id: string;
    label: string;
    description: string;
}

export const TOOL_CATEGORIES: Category[] = [
    {
        id: "core",
        label: "Core Workspace",
        description: "Primary development environments for coding and previewing"
    },
    {
        id: "formats",
        label: "Document Formats",
        description: "Format-specific viewers for HTML, XML, CSV, etc."
    },
    {
        id: "time",
        label: "Time & Date",
        description: "Comprehensive epoch, timezone, and duration utilities"
    },
    {
        id: "crypto",
        label: "Cryptography",
        description: "Hashing, encryption, and secure text processing"
    },
    {
        id: "media",
        label: "Media & Assets",
        description: "Converters and optimizers for images, videos, and fonts"
    }
];

export const TOOLS: Tool[] = [
    {
        id: "draw-tool",
        name: "Quick Draw",
        description: "Simple canvas-based sketching and drawing tool for quick ideas",
        href: "/draw",
        category: "core",
        status: "Available",
        icon: PenTool,
        isNew: true
    },
    {
        id: "editor",
        name: "Code Editor",
        description: "Professional Monaco-based editor with syntax highlighting, auto-save, and formatting",
        href: "/editor",
        category: "core",
        status: "Available",
        icon: FileCode
    },
    // {
    //     id: "ide",
    //     name: "Power IDE",
    //     description: "Integrated development environment with real-time feedback and advanced debugging",
    //     href: "/ide",
    //     category: "core",
    //     status: "Available",
    //     icon: Rocket
    // },
    {
        id: "live-previewer",
        name: "Live Previewer",
        description: "Unified all-in-one viewer and editor for HTML, JSON, Markdown, CSV, SVG, and more formats",
        href: "/view",
        category: "formats",
        status: "Available",
        icon: Eye,
        subOptions: PREVIEWABLE_FORMATS.map(fmt => ({
            name: fmt,
            href: `/view/${fmt}`
        }))
    },
    {
        id: "epoch-converter",
        name: "Epoch Converter",
        description: "Convert between Unix timestamps and human-readable dates",
        href: "/time",
        category: "time",
        status: "Available",
        icon: Clock
    },
    {
        id: "password-tool",
        name: "Password Generator & Checker",
        description: "Generate highly secure passwords and check their strength against leaked databases using WebAssembly",
        href: "/password",
        category: "crypto",
        status: "Available",
        icon: Key
    },
    {
        id: "uuid-generator",
        name: "UUID Generator",
        description: "Generate v4 UUIDs for your applications and tests",
        href: "/crypto",
        category: "crypto",
        status: "Available",
        icon: Shield,
        isNew: true
    },
    {
        id: "dummy-file",
        name: "Dummy File Generator",
        description: "Create placeholder files of any size or type for testing",
        href: "/dummy",
        category: "core",
        status: "Available",
        icon: FilePlus,
        isNew: true
    },
    {
        id: "sql-visualizer",
        name: "SQL Visualizer",
        description: "Turn CREATE TABLE statements into ER diagrams and SELECT queries into readable execution pipelines",
        href: "/sql-visualization",
        category: "core",
        status: "Available",
        icon: Database,
        isNew: true
    },
    {
        id: "code-video",
        name: "Code Typing Video",
        description: "Turn a code snippet into a typing-animation video with playback controls, then export as 4K/120fps MP4 or a PNG snapshot",
        href: "/code-video",
        category: "media",
        status: "Available",
        icon: Clapperboard,
        isNew: true
    },
    {
        id: "code-visualizer",
        name: "Code Visualizer",
        description: "Step through JavaScript or Python line by line and watch variables, the call stack, and heap objects update live",
        href: "/code-visualizer",
        category: "core",
        status: "Available",
        icon: Bug,
        isNew: true
    }
];
