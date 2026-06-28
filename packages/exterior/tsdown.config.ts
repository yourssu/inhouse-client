import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm"],
  dts: {
    build: true,
    sourcemap: true,
  },
  sourcemap: true,
  clean: !process.argv.includes("--watch"),
  deps: {
    neverBundle: [
      "react",
      "react-dom",
      "@tanstack/react-query",
      "@tanstack/react-router",
      "@tanstack/router-core",
      "@tanstack/history",
      "motion",
      "motion/react",
      "overlay-kit",
    ],
    dts: {
      neverBundle: ["@tanstack/react-router", "@tanstack/router-core", "@tanstack/history"],
    },
  },
  hooks: {
    // styles/index.css 는 Tailwind 의 @source 디렉티브만 담고 있어
    // rolldown/lightningcss 가 가공하지 않도록 원본 그대로 dist 로 복사해요.
    "build:done": async (context) => {
      const dest = join(context.options.outDir, "index.css");
      await mkdir(dirname(dest), { recursive: true });
      await copyFile("src/styles/index.css", dest);
    },
  },
});
