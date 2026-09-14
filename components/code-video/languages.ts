"use client";

import Prism from "prismjs";
// Import order matters: each grammar extends the ones before it via
// Prism.languages.extend, so dependencies must already be registered.
import "prismjs/components/prism-clike";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-ruby";
import "prismjs/components/prism-php";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-json";

export { Prism };

export interface LanguageOption {
    id: string;
    label: string;
}

export const LANGUAGES: LanguageOption[] = [
    { id: "javascript", label: "JavaScript" },
    { id: "jsx", label: "JavaScript (JSX)" },
    { id: "typescript", label: "TypeScript" },
    { id: "tsx", label: "TypeScript (TSX)" },
    { id: "python", label: "Python" },
    { id: "java", label: "Java" },
    { id: "csharp", label: "C#" },
    { id: "cpp", label: "C++" },
    { id: "c", label: "C" },
    { id: "go", label: "Go" },
    { id: "rust", label: "Rust" },
    { id: "ruby", label: "Ruby" },
    { id: "php", label: "PHP" },
    { id: "swift", label: "Swift" },
    { id: "kotlin", label: "Kotlin" },
    { id: "sql", label: "SQL" },
    { id: "json", label: "JSON" },
    { id: "yaml", label: "YAML" },
    { id: "bash", label: "Bash / Shell" },
    { id: "markup", label: "HTML" },
    { id: "css", label: "CSS" },
    { id: "markdown", label: "Markdown" },
];

export function getGrammar(languageId: string) {
    return Prism.languages[languageId] || Prism.languages.markup;
}
