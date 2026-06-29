/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const runtimeEnv = globalThis as typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

export default defineConfig({
  plugins: [react()],
  base: runtimeEnv.process?.env?.VITE_BASE_PATH ?? "./",
  test: {
    globals: true,
    environment: "node"
  }
});
