const path = require('path');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'cheap-module-source-map',

  entry: {
    index: [
      './src/index.js',
    ],
  },

  output: {
    filename: '[name].js',
    path: path.resolve('./dist'),
  },

  plugins: [
    new HtmlPlugin({
      template: path.resolve('./src/index.html'),
    }),
  ],

  module: {
    rules: [
      {
        test: /\.worker\.js$/,
        use: {
          loader: 'worker-loader',
          // options: { inline: true } // Use if same origin problems arrise
        },
      },
    ],
  },
};
