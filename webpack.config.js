const path    = require('path')
const webpack = require('webpack')
const eslint  = require('eslint-webpack-plugin')

module.exports = {
  entry: './src/index.coffee',
  mode: 'development',
  devtool: false,
  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: 'datatables-factory.js',
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
                presets: [
                  ['@babel/env', {
                    'targets': {
                      'node': '6.10'
                    },
                    'modules': false
                  }]
                ]
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
