// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier"; // << adiciona o Prettier (flat)

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // suas bases (Next) convertidas via FlatCompat
  ...compat.extends("next/core-web-vitals"),

  // PRETTIER POR ÚLTIMO: desativa regras de formatação conflitantes do ESLint
  prettier,
];
