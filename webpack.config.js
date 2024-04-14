const path = require('path');

module.exports = {
  entry: './src/index.tsx', // Update entry to .tsx if using JSX in the main file
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(frag|vert)$/,
        type: 'asset/source'
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.frag', '.vert']
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  devServer: {
    static: './dist'
  }
};
