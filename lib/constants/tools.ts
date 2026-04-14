import { 
    FileCode, 
    Search, 
    Rocket, 
    Zap, 
    Shield, 
    Braces,
    type LucideIcon
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
        id: "json",
        label: "JSON Suite",
        description: "A comprehensive set of tools to manipulate and format JSON data"
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
        id: "editor",
        name: "Code Editor",
        description: "Professional Monaco-based editor with syntax highlighting, auto-save, and formatting",
        href: "/editor",
        category: "core",
        status: "Available",
        icon: FileCode
    },
    {
        id: "viewer",
        name: "Universal Viewer",
        description: "Multi-format previewer for HTML, JSON, YAML, and Markdown files",
        href: "/view",
        category: "core",
        status: "Available",
        icon: Search
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
        id: "json-formatter",
        name: "JSON Formatter",
        description: "Clean up and validate messy JSON strings instantly",
        href: "/view",
        category: "json",
        status: "Available",
        icon: Braces
    },
    {
        id: "epoch-converter",
        name: "Epoch Converter",
        description: "Convert between Unix timestamps and human-readable dates",
        href: "/convert",
        category: "time",
        status: "Available",
        icon: Zap
    },
    {
        id: "uuid-generator",
        name: "UUID Generator",
        description: "Generate v4 UUIDs for your applications and tests",
        href: "/crypto",
        category: "crypto",
        status: "Coming Soon",
        icon: Shield
    }
];
