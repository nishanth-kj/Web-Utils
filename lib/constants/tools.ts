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
    Bitcoin
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
        id: "html-preview",
        name: "HTML Preview",
        description: "Live preview and editor for HTML documents",
        href: "/view/html",
        category: "formats",
        status: "Available",
        icon: Globe
    },
    {
        id: "json-formatter",
        name: "JSON Formatter",
        description: "Clean up and validate messy JSON strings instantly",
        href: "/view/json",
        category: "json",
        status: "Available",
        icon: Braces
    },
    {
        id: "yaml-view",
        name: "YAML Viewer",
        description: "Validate and visualize YAML configuration files",
        href: "/view/yaml",
        category: "formats",
        status: "Available",
        icon: StickyNote
    },
    {
        id: "react-code",
        name: "React Playground",
        description: "Write and preview React components in the browser",
        href: "/view/react",
        category: "core",
        status: "Available",
        icon: Box
    },
    {
        id: "markdown-view",
        name: "Markdown Editor",
        description: "Write and preview Markdown with GitHub-flavored support",
        href: "/view/markdown",
        category: "formats",
        status: "Available",
        icon: FileEdit
    },
    {
        id: "xml-viewer",
        name: "XML Viewer",
        description: "Format and inspect XML documents",
        href: "/view/xml",
        category: "formats",
        status: "Available",
        icon: FileCode
    },
    {
        id: "svg-render",
        name: "SVG Renderer",
        description: "Live preview for SVG graphics and icons",
        href: "/view/svg",
        category: "media",
        status: "Available",
        icon: Image
    },
    {
        id: "csv-viewer",
        name: "CSV Viewer",
        description: "View and filter comma-separated values as tables",
        href: "/view/csv",
        category: "formats",
        status: "Available",
        icon: Table
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
        id: "draw-tool",
        name: "Quick Draw",
        description: "Simple canvas-based sketching and drawing tool for quick ideas",
        href: "/draw",
        category: "media",
        status: "Available",
        icon: PenTool
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
