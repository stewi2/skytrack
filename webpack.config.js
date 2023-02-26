const path = require('path');
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
entry: './src/main.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'static/scripts/'),
    library: {
      type: "module",
    },
  },
  devtool: "inline-source-map",
/*
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
*/
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    })
  ],
  mode: "development",
  optimization: {
    minimize: false
  },
  experiments: {
    outputModule: true,
  }, 
};