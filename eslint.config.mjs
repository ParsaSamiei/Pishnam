import nextConfig from "eslint-config-next";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = [
  ...nextConfig,
  {
    // eslint-config-next already registers the "jsx-a11y" plugin (for its
    // own handful of jsx-a11y/* rules), so we only pull in the *rules* from
    // the plugin's recommended preset here rather than its `plugins` key --
    // re-registering the same plugin name throws a "Cannot redefine plugin"
    // config error.
    rules: jsxA11y.flatConfigs.recommended.rules,
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Server actions / route handlers legitimately use `any` for raw form
      // data in a few spots before zod parsing narrows it -- keep as a warn.
      "@typescript-eslint/no-explicit-any": "warn",
      "jsx-a11y/anchor-is-valid": "off", // next/link triggers false positives
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
