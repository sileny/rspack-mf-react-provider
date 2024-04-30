import rspack from "@rspack/core";
import refreshPlugin from "@rspack/plugin-react-refresh";
import { dirname, join, resolve } from "node:path";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import { fileURLToPath } from 'node:url'
import { createRequire } from "node:module";

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === "development";

const name = "host-runtime";
const port = 3002;
const plugins = [
  new rspack.HtmlRspackPlugin({
    template: "./public/index.html",
    excludedChunks: [name],
    filename: "index.html",
    inject: true,
  }),
  new ModuleFederationPlugin({
    name,
    filename: "remoteEntry.js",
    //   remotes: {
    //    provider: "provider@http://localhost:3001/mf-manifest.json",
    // },
    shared: ["react", "react-dom"],
  }),
];

if (isDev) {
  plugins.push(
    new rspack.HotModuleReplacementPlugin(),
    new refreshPlugin(),
  );
}

export default {
  //context: __dirname,
  entry: resolve(__dirname, './src/index.tsx'),
  resolve: {
    extensions: ["...", ".ts", ".tsx", ".jsx"],
  },
  devServer: {
    port,
    static: {
      directory: join(__dirname, "dist"),
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
    },
  },

  devtool: "source-map",
  optimization: { minimize: false },
  output: {
    path: join(__dirname, "build"),
    uniqueName: `${name}-${port}`,
    publicPath: `http://localhost:${port}/`,
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /(node_modules|\.webpack)/,
        use: [
          {
            loader: "builtin:swc-loader",
            options: {
              sourceMap: true,
              jsc: {
                parser: {
                  syntax: "typescript",
                  tsx: true,
                },
                transform: {
                  react: {
                    runtime: "automatic",
                    development: isDev,
                    refresh: isDev,
                  },
                },
              },
              env: {
                targets: ["chrome >= 87", "edge >= 88", "firefox >= 78", "safari >= 14"],
              },
            },
          },
        ],
      },
    ],
  },
  plugins,
};
