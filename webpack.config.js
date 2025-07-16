const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load environment variables
const env = dotenv.config().parsed || {};

// Create a new webpack.DefinePlugin instance with our environment variables
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  entry: './src/client/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      components: path.resolve(__dirname, 'src/client/components/'),
      styles: path.resolve(__dirname, 'src/client/styles/'),
      utils: path.resolve(__dirname, 'src/client/utils/')
    },
    fallback: {
      "buffer": require.resolve("buffer/")
    }
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.excalidrawlib$/,
        type: 'json'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
      title: 'BEAVER - Business Flow Diagrams'
    }),
    new webpack.DefinePlugin({
      ...envKeys,
      'process.env': JSON.stringify(process.env),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    })
  ],
  devServer: {
    historyApiFallback: true,
    port: env.FRONTEND_PORT || 3123,
    proxy: [{
      context: ['/api'],
      target: `http://localhost:${env.BACKEND_PORT || 3124}`,
      secure: false,
      changeOrigin: true
    }]
  }
}; 