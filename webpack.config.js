const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const webpack = require('webpack');
const deps = require("./package.json").dependencies;
const TerserPlugin = require('terser-webpack-plugin');
const dotenv = require('dotenv');

module.exports = (env) => {
  // Load environment variables from .env file
  const environment = env.NODE_ENV || 'development';
  const envPath = `.env.${environment}`;
  const envConfig = dotenv.config({ path: envPath }).parsed || {};
  const isProduction = environment === 'production';

  // Add build time and version information
  const buildConfig = {
    ...envConfig,
    BUILD_TIME: new Date().toISOString(),
    VERSION: require('./package.json').version,
    APP_NAME: require('./package.json').name,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    isStaging: environment === 'staging',
  };

  // Log the config for debugging
  console.log('Environment:', environment);
  console.log('Config:', buildConfig);

  return {
    mode: isProduction ? 'production' : 'development',
    entry: "./src/index.ts",
    devtool: isProduction ? false : 'eval-source-map',
    devServer: { 
      port: 3001,
      historyApiFallback: true,
      hot: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
      }
    },
    output: { 
      publicPath: "auto",
      uniqueName: "mroven",
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash].js',
      chunkFilename: '[name].[contenthash].js',
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ],
      runtimeChunk: false,
      splitChunks: false
    },
    performance: {
      maxEntrypointSize: 800000,
      maxAssetSize: 800000,
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
        {
          test: /\.(scss|sass)$/,
          use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
        },
      ]
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        'lift-ui': path.resolve(__dirname, '../lift-ui/dist'),
      },
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          APP_NAME: JSON.stringify(buildConfig.APP_NAME),
          VERSION: JSON.stringify(buildConfig.VERSION),
          BUILD_TIME: JSON.stringify(buildConfig.BUILD_TIME),
          API_URL: JSON.stringify(buildConfig.API_URL),
          ENABLE_MOCK_API: JSON.stringify(buildConfig.ENABLE_MOCK_API),
          ENABLE_NEW_UI: JSON.stringify(buildConfig.ENABLE_NEW_UI),
          ENABLE_ANALYTICS: JSON.stringify(buildConfig.ENABLE_ANALYTICS),
          DEBUG: JSON.stringify(buildConfig.DEBUG),
          LOG_LEVEL: JSON.stringify(buildConfig.LOG_LEVEL),
        }
      }),
      new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: true,
      }),
      new ModuleFederationPlugin({
        name: "mroven",
        filename: "remoteEntry.js",
        exposes: { "./App": "./src/App" },
        shared: {
          react: { 
            singleton: true, 
            requiredVersion: deps.react, 
            eager: true,
            shareScope: 'default'
          },
          "react-dom": { 
            singleton: true, 
            requiredVersion: deps["react-dom"], 
            eager: true,
            shareScope: 'default'
          },
          "react-router-dom": { 
            singleton: true, 
            requiredVersion: deps["react-router-dom"], 
            eager: true,
            shareScope: 'default'
          },
          "lift-ui": { 
            singleton: true, 
            eager: true, 
            import: path.resolve(__dirname, '../lift-ui/dist'),
            shareScope: 'default'
          }
        }
      })
    ],
  };
}; 