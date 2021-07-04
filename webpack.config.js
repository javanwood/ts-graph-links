const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  devServer: {
    open: true,
    hot: true,
    contentBase: path.join(__dirname, 'dist'),
    port: 5678,
  },
  module: {
    rules: [
      {
        test: /\.(m?js|ts)$/,
        exclude: /(node_modules)/,
        use:  [`swc-loader`]
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Mappy Thing',
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
   clean: true,
  },
};