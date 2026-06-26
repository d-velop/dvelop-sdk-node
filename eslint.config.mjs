import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jestPlugin from "eslint-plugin-jest";
import globals from "globals";

export default [
  {
    ignores: ["**/lib/**", "**/tmp-*.ts"],
  },
  js.configs.recommended,
  {
    files: ["packages/**/*.ts", "e2e/**/*.ts"],
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    languageOptions: {
      parser: tsParser,
      globals: {
        ...globals.node,
        ...globals.browser,
        Console: "readonly",
      },
    },
    rules: {
      "semi": ["error", "always"],
      "quotes": ["error", "double"],
      "indent": ["error", 2],
      "function-call-argument-newline": ["error", "never"],
      "function-paren-newline": ["error", "multiline"],
      "no-console": ["error"],
      "no-var": "error",
      "no-redeclare": "off",
      "@typescript-eslint/no-redeclare": ["error"],
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/adjacent-overload-signatures": ["error"],
    },
  },
  {
    ...jestPlugin.configs["flat/recommended"],
    files: ["packages/**/*.spec.ts", "e2e/**/*.spec.ts"],
  },
];
