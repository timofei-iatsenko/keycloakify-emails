import typescript from "typescript-eslint";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import storybook from "eslint-plugin-storybook";

export default defineConfig(
  js.configs.recommended,
  typescript.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  eslintConfigPrettier,
  storybook.configs["flat/recommended"],
  {
    ignores: ["dist/**", "**/locales/*.ts", "public/**"],
  },
  {
    plugins: {
      "react-refresh": reactRefresh,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "react-hooks/exhaustive-deps": "off",
      "@typescript-eslint/no-redeclare": "off",
      "no-labels": "off",
    },
  },
  {
    files: ["**/*.stories.*"],
    rules: {
      "import/no-anonymous-default-export": "off",
    },
  },
  {
    files: ["./src/email/**"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "react-refresh/only-export-components": "off",
      "react/no-unescaped-entities": "off",
    },
  },
);
