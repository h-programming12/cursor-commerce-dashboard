import type { StorybookConfig } from "@storybook/react-webpack5";
import path from "path";

const config: StorybookConfig = {
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  stories: [
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
    "../app/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-links",
    "@storybook/addon-interactions",
    "@storybook/addon-actions",
  ],
  typescript: {
    reactDocgen: "react-docgen-typescript",
    check: false,
  },
  staticDirs: ["../public"],
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": path.resolve(__dirname, ".."),
      };
    }

    // PostCSS 및 Tailwind CSS 지원
    if (config.module?.rules) {
      // 타입 가드: RuleSetRule인지 확인
      const isRuleSetRule = (
        rule: unknown
      ): rule is { test?: unknown; use?: unknown } => {
        return (
          typeof rule === "object" &&
          rule !== null &&
          typeof rule !== "string" &&
          "test" in rule
        );
      };

      // CSS 파일 처리 규칙 찾기
      const cssRule = config.module.rules.find((rule) => {
        if (!isRuleSetRule(rule)) return false;
        return (
          rule.test &&
          (rule.test.toString().includes("css") ||
            rule.test.toString().includes("\\.css"))
        );
      });

      if (cssRule && isRuleSetRule(cssRule)) {
        // PostCSS loader 추가 확인
        const hasPostCssLoader = (loader: unknown) => {
          if (!loader) return false;
          const loaderPath =
            typeof loader === "string"
              ? loader
              : (loader as { loader?: string }).loader || "";
          return loaderPath.includes("postcss-loader");
        };

        const checkPostCss = (rule: { use?: unknown }) => {
          if (Array.isArray(rule.use)) {
            return rule.use.some(hasPostCssLoader);
          } else if (rule.use) {
            return hasPostCssLoader(rule.use);
          }
          return false;
        };

        if (!checkPostCss(cssRule)) {
          // PostCSS loader 추가
          const postcssLoader = {
            loader: require.resolve("postcss-loader"),
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "..", "postcss.config.mjs"),
              },
            },
          };

          if (Array.isArray(cssRule.use)) {
            // css-loader 다음에 postcss-loader 추가 (순서: style-loader -> postcss-loader -> css-loader)
            const cssLoaderIndex = cssRule.use.findIndex((loader: unknown) => {
              const loaderPath =
                typeof loader === "string"
                  ? loader
                  : (loader as { loader?: string }).loader || "";
              return loaderPath.includes("css-loader");
            });

            if (cssLoaderIndex !== -1) {
              // css-loader 다음에 postcss-loader 추가
              cssRule.use.splice(cssLoaderIndex + 1, 0, postcssLoader);
            } else {
              // css-loader가 없으면 맨 앞에 추가 (style-loader 다음)
              const styleLoaderIndex = cssRule.use.findIndex(
                (loader: unknown) => {
                  const loaderPath =
                    typeof loader === "string"
                      ? loader
                      : (loader as { loader?: string }).loader || "";
                  return loaderPath.includes("style-loader");
                }
              );

              if (styleLoaderIndex !== -1) {
                cssRule.use.splice(styleLoaderIndex + 1, 0, postcssLoader);
              } else {
                cssRule.use.push(postcssLoader);
              }
            }
          } else if (cssRule.use) {
            cssRule.use = [cssRule.use, postcssLoader];
          } else {
            cssRule.use = [postcssLoader];
          }
        }
      }
    }

    // TypeScript 파일 처리 - babel-loader 규칙 명시적으로 추가
    if (config.module?.rules) {
      // 타입 가드: RuleSetRule인지 확인
      const isRuleSetRule = (
        rule: unknown
      ): rule is { test?: unknown; use?: unknown; loader?: unknown } => {
        return (
          typeof rule === "object" &&
          rule !== null &&
          typeof rule !== "string" &&
          "test" in rule
        );
      };

      // 기존 TypeScript 규칙 찾기
      const existingTsRule = config.module.rules.find((rule) => {
        if (!isRuleSetRule(rule)) return false;
        return (
          rule.test &&
          (rule.test.toString().includes("tsx?") ||
            rule.test.toString().includes("\\.ts"))
        );
      });

      if (existingTsRule && isRuleSetRule(existingTsRule)) {
        // babel-loader가 없으면 추가
        const hasBabelLoader = (loader: unknown) => {
          if (!loader) return false;
          const loaderPath =
            typeof loader === "string"
              ? loader
              : (loader as { loader?: string }).loader || "";
          return loaderPath.includes("babel-loader");
        };

        const checkRule = (rule: { use?: unknown; loader?: unknown }) => {
          if (Array.isArray(rule.use)) {
            return rule.use.some(hasBabelLoader);
          } else if (rule.use) {
            return hasBabelLoader(rule.use);
          } else if (rule.loader) {
            return hasBabelLoader(rule.loader);
          }
          return false;
        };

        if (!checkRule(existingTsRule)) {
          // babel-loader 추가
          const babelLoader = {
            loader: require.resolve("babel-loader"),
            options: {
              presets: [
                require.resolve("@babel/preset-env"),
                [
                  require.resolve("@babel/preset-react"),
                  { runtime: "automatic" },
                ],
                [
                  require.resolve("@babel/preset-typescript"),
                  { isTSX: true, allExtensions: true },
                ],
              ],
            },
          };

          if (Array.isArray(existingTsRule.use)) {
            existingTsRule.use.unshift(babelLoader);
          } else if (existingTsRule.use) {
            existingTsRule.use = [babelLoader, existingTsRule.use];
          } else {
            existingTsRule.use = [babelLoader];
          }
        } else {
          // babel-loader가 있으면 TypeScript preset 확인 및 추가
          const updateBabelLoader = (loader: unknown) => {
            if (!loader || typeof loader !== "object") return;
            const loaderObj = loader as {
              loader?: string;
              options?: { presets?: unknown[] };
            };
            const loaderPath =
              typeof loaderObj.loader === "string" ? loaderObj.loader : "";
            if (loaderPath.includes("babel-loader")) {
              if (!loaderObj.options) loaderObj.options = {};
              if (!loaderObj.options.presets) loaderObj.options.presets = [];

              const hasTypeScriptPreset = loaderObj.options.presets.some(
                (preset: unknown) => {
                  const presetName = Array.isArray(preset) ? preset[0] : preset;
                  return (
                    typeof presetName === "string" &&
                    presetName.includes("typescript")
                  );
                }
              );

              if (
                !hasTypeScriptPreset &&
                Array.isArray(loaderObj.options.presets)
              ) {
                loaderObj.options.presets.push([
                  require.resolve("@babel/preset-typescript"),
                  { isTSX: true, allExtensions: true },
                ]);
              }
            }
          };

          if (Array.isArray(existingTsRule.use)) {
            existingTsRule.use.forEach(updateBabelLoader);
          } else if (existingTsRule.use) {
            updateBabelLoader(existingTsRule.use);
          }
        }
      } else {
        // TypeScript 규칙이 없으면 새로 추가
        config.module.rules.push({
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve("babel-loader"),
              options: {
                presets: [
                  require.resolve("@babel/preset-env"),
                  [
                    require.resolve("@babel/preset-react"),
                    { runtime: "automatic" },
                  ],
                  [
                    require.resolve("@babel/preset-typescript"),
                    { isTSX: true, allExtensions: true },
                  ],
                ],
              },
            },
          ],
        });
      }
    }

    return config;
  },
};

export default config;
