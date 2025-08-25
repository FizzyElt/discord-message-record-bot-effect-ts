import js from "@eslint/js";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default tseslint.config([
    {
        files: ["./src/**/*.{ts,tsx}", "drizzle.config.ts"],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
            eslintPluginPrettierRecommended,
            {
                rules: {
                    "no-unused-vars": "off",
                    "@typescript-eslint/no-unused-vars": [
                        "error",
                        {
                            args: "all",
                            argsIgnorePattern: "^_",
                            caughtErrors: "all",
                            caughtErrorsIgnorePattern: "^_",
                            destructuredArrayIgnorePattern: "^_",
                            varsIgnorePattern: "^_",
                            ignoreRestSiblings: true,
                        },
                    ],
                },
            },
        ],
        languageOptions: {
            ecmaVersion: "latest",
        },
    },
    {
        files: ["./src/**/*.{ts,tsx}", "drizzle.config.ts"],
        plugins: { perfectionist },
        rules: {
            "perfectionist/sort-imports": [
                "error",
                {
                    type: "alphabetical",
                    order: "asc",
                    fallbackSort: { type: "unsorted" },
                    ignoreCase: false,
                    specialCharacters: "keep",
                    internalPattern: ["^~/.+", "^@/.+"],
                    partitionByComment: false,
                    partitionByNewLine: false,
                    maxLineLength: undefined,
                    newlinesBetween: 0,
                    groups: [
                        "named-type-builtin",
                        "value-builtin",
                        "type-external",
                        "value-external",
                        "named-type-internal",
                        "value-internal",
                        "named-type-parent",
                        "value-parent",
                        "named-type-sibling",
                        "value-sibling",
                    ],
                },
            ],
        },
    },
]);
