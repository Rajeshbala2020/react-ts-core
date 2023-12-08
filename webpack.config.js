const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  //...
  entry: './docs',
  devtool: 'source-map',
  devServer: {
    contentBase: './docs',
    hot: true,
    port: 3001, // port to run the dev server on
    // stats: 'errors-only', // only show errors in the output
    clientLogLevel: 'silent',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },

      {
        test: /\.tsx?$/,
        exclude: (file) =>
          /node_modules/.test(file) && !/\.qbs-core/.test(file),
        use: 'ts-loader',
      },

      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: /node_modules/,
      },

      {
        test: /\.svg$/,
        use: ['@svgr/webpack', 'file-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new HtmlWebpackPlugin({
      template: './docs/index.html', // your html file
    }),
  ],
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename], // invalidate cache on config change
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  //...
};
