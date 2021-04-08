const currentTask = process.env.npm_lifecycle_event;
const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fse = require('fs-extra');

const postCSSPlugins = [
  require('postcss-import'),
  require('postcss-mixins'),
  require('postcss-simple-vars'),
  require('postcss-nested'),
  require('postcss-hexrgba'),
  require('autoprefixer')
]

class RunAfterCompile {
  apply(compiler) {
    compiler.hooks.done.tap('Copy images', function() { // tap name random
      // copy sync from folder to folder
      // for github pages build process folder needs to be called 'docs'
      // usually common name is 'dist'
      fse.copySync('./app/assets/images', './docs/assets/images');
    })
  }
}

let cssConfig = {
  test: /\.css$/i,
  use: ['css-loader?url=false',
        {loader: 'postcss-loader',
         options: {postcssOptions: {plugins: postCSSPlugins}}}]
}

let pages = fse.readdirSync('./app').filter(function(file) {
  return file.endsWith('.html');
}).map(function(page) {
  return new HtmlWebpackPlugin({
    filename: page,
    template: `./app/${page}`
  });
});

let config = {
  entry: './app/assets/scripts/App.js',
  plugins: pages,
  module: {
    rules: [
      cssConfig,
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      }
    ]
  }
};

if (currentTask == 'dev') {
  cssConfig.use.unshift('style-loader'),
  config.output = {
    filename: 'bundled.js',
    path: path.resolve(__dirname, 'app')
  },
  config.devServer = {
    before: function(app, server) {  // reloads browser when changing HTML files
      server._watch('./app/**/*.html')
    },
    contentBase: path.join(__dirname, 'app'),
    hot: true,  // updates CSS & JS without a full reload
    port: 3000,
    host: '0.0.0.0'
  },
  //config.watch =  true,  // instead use devServer
  config.mode = 'development'
}

if (currentTask == 'build') {
  cssConfig.use.unshift(MiniCssExtractPlugin.loader)
  config.output = {
    // naming chunks
    filename: '[name].[chunkhash].js',
    chunkFilename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'docs')  // 'dist'
  },
  config.mode = 'production',
  // split code up in chunks: own continuously changing files
  // and others like packages with rare updates (vendors)
  config.optimization = {
    splitChunks: { chunks: 'all'},
    minimize: true,
    minimizer: [`...`, new CssMinimizerPlugin()] // `...` default minimizer
  },
  // delete dist folder before build (cleanwebpack)
  // extract css file from app folder to split it (minicssextract)
  config.plugins.push(
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({filename: 'styles.[chunkhash].css'}),
    new RunAfterCompile()
  )
}

module.exports = config;
