import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored/generated output, not app source.
    "wasm/pkg/**",
    // Bundled Claude Code skill files, not part of this app.
    ".agents/**",
    // Plain CommonJS Node build script (no "type": "module" in package.json),
    // so require() here is intentional rather than a lint violation.
    "scripts/submit-indexnow.js",
  ]),
]);

export default eslintConfig;
