import { defineConfig } from "eslint/config";
import js from "@eslint/js";

export default defineConfig([
  {
    files: ["src/**/*.js", "ext/**/*.js"],
    ignores: ["**/*.config.js", "node_modules/**", "dist-*/**/*.js"],
    plugins: { js },
    extends: ["js/recommended"],
  },

  {
    languageOptions: {
      globals: {
        wx: "readonly",
        App: "readonly",
        Page: "readonly",
        Component: "readonly",
        getApp: "readonly",
        getCurrentPages: "readonly",
        require: "readonly",
        module: "readonly",
        console: "readonly",
      },
    },
    ignores: ["**/*.config.js", "node_modules/**", "dist-*/**/*.js"],
    rules: {
      "no-unused-vars": "warn", // 定义变量未使用
      "no-undef": "warn",
      "object-curly-newline": "off",
      "linebreak-style": "off",
      complexity: ["error", { max: 96 }],
      "no-nested-ternary": "off",
      "consistent-return": "off",
      "arrow-body-style": "off",
      "class-methods-use-this": "off",
      "no-use-before-define": "off",
      eqeqeq: "off",
      "no-restricted-globals": "off",
      "no-prototype-builtins": "off",
      "no-lonely-if": "off", // 在if中写if
      camelcase: "off", // 驼峰
      "no-unused-expressions": "off",
      "no-cond-assign": "off",
      "max-len": "off",
      "no-mixed-operators": "off",
      "prefer-spread": "off",
      "no-case-declarations": "off",
      "new-cap": "off",
      "no-shadow": "off", // 变量作用域相同名称，暂时关闭
      "comma-dangle": [
        "warn",
        {
          arrays: "always-multiline",
          objects: "always-multiline",
          imports: "always-multiline",
          exports: "always-multiline",
          functions: "ignore",
        },
      ],
    },
  },
]);
