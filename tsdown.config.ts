import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["./src/index.ts"],
    platform: "node",
    format: "esm",
    outDir: "dist",
    dts: false,
    // 把所有 dependencies 打包進來，runtime image 不需要 node_modules
    deps: {
        alwaysBundle: [/.*/],
        onlyBundle: false,
    },
});
