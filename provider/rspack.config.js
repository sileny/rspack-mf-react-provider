import rspack from "@rspack/core";
import refreshPlugin from "@rspack/plugin-react-refresh";
import { dirname, join, resolve } from "node:path";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import { fileURLToPath } from 'node:url'
import { createRequire } from "node:module";

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === "development";

const name = "provider";
const port = 3001;
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
    exposes: {
      "./Hello": "./src/components/hello/index.tsx",
      "./const": "./src/const.ts",
    },
    // shared: {
    //   ...deps,
    //   "react-router-dom": {
    //     singleton: true,
    //   },
    //   "react-dom": {
    //     singleton: true,
    //   },
    //   react: {
    //     singleton: true,
    //   },
    // },
  }),
];

if (isDev) {
  plugins.push(
    new rspack.HotModuleReplacementPlugin(),
    new refreshPlugin(),
  );
}

export default {
  entry: resolve(__dirname, './src/index.tsx'),
  resolve: {
    extensions: ["...", ".ts", ".tsx", ".jsx"],
  },

  devtool: "source-map",
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
