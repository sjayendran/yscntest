const path = require('path');

module.exports = {
  entry: './static/js/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'static/js')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      }
    ]
  }
};