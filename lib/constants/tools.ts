import {
    Box,
    Braces,
    Clock,
    FileCode,
    FileEdit,
    Globe,
    Image,
    type LucideIcon,
    Rocket,
    Shield,
    StickyNote,
    Table,
    PenTool,
    FilePlus,
    Bitcoin,
    Eye
} from 'lucide-react';

export interface Tool {
    id: string;
    name: string;
    description: string;
    href: string;
    category: string;
    status: 'Available' | 'Coming Soon' | 'Beta';
    icon: LucideIcon;
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
        icon: PenTool
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
    {
        id: "ide",
        name: "Power IDE",
        description: "Integrated development environment with real-time feedback and advanced debugging",
        href: "/ide",
        category: "core",
        status: "Available",
        icon: Rocket
    },
    {
        id: "live-previewer",
        name: "Live Previewer",
        description: "Unified all-in-one viewer and editor for HTML, JSON, Markdown, CSV, SVG, and more formats",
        href: "/view",
        category: "formats",
        status: "Available",
        icon: Eye
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
        id: "uuid-generator",
        name: "UUID Generator",
        description: "Generate v4 UUIDs for your applications and tests",
        href: "/crypto",
        category: "crypto",
        status: "Available",
        icon: Shield
    },
    {
        id: "dummy-file",
        name: "Dummy File Generator",
        description: "Create placeholder files of any size or type for testing",
        href: "/dummy",
        category: "core",
        status: "Available",
        icon: FilePlus
    },
    {
        id: "blockchain-tool",
        name: "Blockchain Inspector",
        description: "Analyze wallet addresses, transactions, and block data across major chains",
        href: "/crypto/blockchain",
        category: "crypto",
        status: "Available",
        icon: Bitcoin
    }
];
