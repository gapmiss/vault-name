import { defineConfig, globalIgnores } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

export default defineConfig([
    globalIgnores(["node_modules", "main.js", "*.mjs", "package-lock.json", "versions.json", "tsconfig.json"]),
    ...obsidianmd.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
            },
        },
    },
    {
        files: ["**/*.ts"],
        rules: {
            "obsidianmd/prefer-active-doc": "error",
            "obsidianmd/ui/sentence-case": "off",
            "no-console": ["error", { allow: ["warn", "error", "debug"] }],
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
        },
    },
]);
