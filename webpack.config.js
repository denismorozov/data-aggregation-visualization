var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');

var TARGET = process.env.npm_lifecycle_event;
const PATHS = {
  app: path.join(__dirname, 'app'),
  build: path.join(__dirname, 'build')
};

// pass target environment to Babel
process.env.BABEL_ENV = TARGET;

var common = {
  entry: PATHS.app,

  // allows referring to JS/JSX files without an extension
  resolve: {
    extensions: ['', '.js']
  },

  module: {
    loaders: [
      {
        // what files to look for
        test: /\.css$/,
        // css-loader gets evaluated before style-loader
        // css-loader will resolve @import and url statements in CSS files
        // style-loader deals with require statements in JavaScript
        loaders: ['style', 'css'],
        // where to look for files; there is also 'exclude' option
        include: PATHS.app
      },

      {
        test: /\.js?$/,
        loaders: ['babel'],
        include: PATHS.app
      }
    ]
  },

  plugins: [
  ]
};

// Alternative to merging is to have a seperate webpack config file
// See: https://github.com/webpack/react-starter
if(TARGET === 'start' || !TARGET) {
  module.exports = merge(common, {
    // alternative source maps for bigger projects are:
    // 'cheap-module-eval-source-map'
    // 'eval'
    devtool: 'eval-source-map',
    devServer: {
      historyApiFallback: true,
      hot: true,
      // embeds webpack-dev-server runtime into the bundle
      // otherwise more entry points are needed
      inline: true,
      progress: true,
      stats: 'errors-only',
      // quiet: true,

      // parse host and port from env to easily customize
      host: process.env.HOST,
      port: process.env.PORT
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  });
}

