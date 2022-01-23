const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");



var config = {
  entry: "/src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    publicPath: "/",
    contentBase: "./dist",

    hot: true,
    open: true,
    watchOptions: {
      ignored: /node_modules/,
      poll: 1000,
    },
    port: 9000,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        include: path.resolve(__dirname, "src"),
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    })
  ]
};


module.exports = (env, argv) => {

  console.log(`dev env value ${env.NODE_MS_API}`);
  //process.env.NODE_MS_API = env.NODE_MS_API;

  config.plugins.push(new webpack.DefinePlugin({
    "process.env": {
      NODE_MS_API: JSON.stringify(env.NODE_MS_API)
    }
  }));

  if (argv.mode === 'development') {
    config.devtool = 'source-map';
  }

  if (argv.mode === 'production') {

  }

  return config;
};



