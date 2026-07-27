const path    = require('path')
const webpack = require('webpack')
const eslint  = require('eslint-webpack-plugin')

module.exports = {
  entry: './src/index.coffee',
  // The bundle in dist/ is what ships to gem and npm consumers: build it
  // minified. Override with NODE_ENV=development for a readable build.
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: 'datatables-factory.js',
    library: 'DatatableBase',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.coffee$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'coffee-loader',
            options: {
              transpile: {
                presets: ["@babel/env"]
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new eslint({'files': 'src', 'extensions': ['coffee']})
  ]
}
