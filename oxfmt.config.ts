import { defineConfig } from "oxfmt";

export default defineConfig({
    tabWidth: 4,
    printWidth: 100,
    endOfLine: "lf",
    semi: true,
    singleQuote: false,
    sortImports: {
        groups: [
            "type-import",
            ["value-builtin", "value-external"],
            "type-internal",
            "value-internal",
            ["type-parent", "type-sibling", "type-index"],
            ["value-parent", "value-sibling", "value-index"],
            "unknown",
        ],
    },
});
