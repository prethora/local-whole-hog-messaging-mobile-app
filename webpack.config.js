const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const dotenv = require("dotenv");

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = argv.mode === 'development';

  const basePath = path.resolve(__dirname, ".env");
  const envConfig = dotenv.parse(fs.readFileSync(basePath));

  const envKeys = Object.entries(envConfig).reduce((acc, [key, value]) => {
    if (key.startsWith("REACT_APP_")) {
      acc[`process.env.${key}`] = JSON.stringify(value);
    }
    return acc;
  }, {});

  return {
    mode: argv.mode || 'development',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    entry: {
      app: './src/index.tsx',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      publicPath: '',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                presets: [
                  '@babel/preset-env',
                  [
                    '@babel/preset-react',
                    {
                      runtime: 'automatic'
                    }
                  ],
                  '@babel/preset-typescript'
                ],

                plugins: [
                  // only in development, for true React Fast Refresh HMR
                  isDevelopment && require.resolve('react-refresh/babel')
                ].filter(Boolean)
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            isDevelopment
              ? 'style-loader'
              : {
                loader: MiniCssExtractPlugin.loader,
                options: {
                  publicPath: '../',
                },
              },
            {
              loader: 'css-loader',
              options: { importLoaders: 1 },
            },
            'postcss-loader',
          ],
        },
        {
          test: /\.(woff2?|eot|ttf|otf|svg)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][hash][ext]'
          }
        },
        {
          test: /\.(png|jpe?g|gif|bmp)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][contenthash][ext]'
          }
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        chunks: ['app'],
      }),
      isProduction && new MiniCssExtractPlugin({
        filename: 'styles/[name].[contenthash].css',
      }),
      isDevelopment && new ReactRefreshWebpackPlugin(),
      new webpack.DefinePlugin(envKeys),
    ].filter(Boolean),
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'dist'),
      },
      hot: true,
      liveReload: false,
      host: "0.0.0.0",
      open: true,
      port: 3000,
      historyApiFallback: true,
    },
  };
};