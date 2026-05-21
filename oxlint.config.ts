import { defineConfig } from "oxlint";

export default defineConfig({
    plugins: ["oxc", "typescript", "unicorn", "vitest", "promise", "eslint", "import"],
    categories: {
        correctness: "error",
        nursery: "error",
        restriction: "warn",
    },
    rules: {
        "import/no-default-export": "allow",
        curly: "error",
        "arrow-body-style": ["error", "as-needed", { requireReturnForObjectLiteral: true }],
        "import/newline-after-import": ["error", { count: 1 }],
        "oxc/no-async-await": "off",
        "oxc/no-barrel-file": "off",
        "oxc/no-optional-chaining": "off",
        "oxc/no-rest-spread-properties": "off",
        "typescript/explicit-function-return-type": "off",
        "eslint/no-undefined": "off",
        "no-console": "off",
        "eslint/no-undef": "off",
    },

    settings: {
        jsdoc: {
            ignorePrivate: false,
            ignoreInternal: false,
            ignoreReplacesDocs: true,
            overrideReplacesDocs: true,
            augmentsExtendsReplacesDocs: false,
            implementsReplacesDocs: false,
            exemptDestructuredRootsFromChecks: false,
            tagNamePreference: {},
        },
        vitest: {
            typecheck: false,
        },
    },
    env: {
        builtin: true,
    },
    globals: {},
    ignorePatterns: [],
});
