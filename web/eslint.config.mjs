import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import onlyWarn from "eslint-plugin-only-warn";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/prop-types": "off", // Using TypeScript for prop validation
    },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    rules: {
      ...config.rules,
      "@typescript-eslint/no-explicit-any": "off", // Override to allow any usage
    },
  })),
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "no-restricted-globals": "off",
      "prefer-destructuring": "off",
      "no-trailing-spaces": "off",
      "no-console": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-multiple-empty-lines": "off",
      "import/order": "off",
      //#region  //*=========== Unused Import ===========
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all", // Required for argsIgnorePattern to work
          argsIgnorePattern: "^_", // Ignores arguments starting with _
          varsIgnorePattern: "^_", // Ignores variables starting with _
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": "off",
      //#endregion  //*======== Unused Import ===========

      //#region  //*=========== Import Sort ===========
      "simple-import-sort/exports": "warn",
      // "simple-import-sort/imports": "warn",
      "simple-import-sort/imports": [
        "warn",
        {
          groups: [
            // Side effect imports.
            ["^\\u0000"],
            // Node.js builtins prefixed with `node:`.
            ["^node:"],
            // Packages.
            // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
            ["^@?\\w"],
            // Absolute imports and other imports such as Vue-style `@/foo`.
            // Anything not matched in another group.
            ["^"],
            // Relative imports.
            // Anything that starts with a dot.
            ["^\\."],
          ],
        },
      ],
    },
  },
  {
    // Final override to ensure any usage is allowed
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];
