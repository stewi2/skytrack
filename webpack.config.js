const path = require('path');
const webpack = require('webpack')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: './src/main',
  output: {
    path: path.resolve(__dirname, 'static/scripts/'),
    library: {
      type: "module",
    },
  },
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
    new MiniCssExtractPlugin({ filename: '../style/style.css' })
  ],
  mode: "development",
  optimization: {
    minimize: false
  },
  experiments: {
    outputModule: true,
  }, 
};