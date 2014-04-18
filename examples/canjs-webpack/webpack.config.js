var webpack = require("webpack");
module.exports = {
  resolve: {
    alias: {
      // This way we can steal("can") even though what we actually have in
      // node_modules is canjs
      "can": "canjs",
      // canjs does steal("jquery") and expects to find it somewhere. We nudge
      // it in the right direction here.
      "jquery/jquery.js": "canjs/lib/jquery.1.9.1.js"
    }
  },
  plugins: [
    // This prevents webpack from compiling every single .js file in the source
    // tree just because someone decided to do a dynamic require (which canjs
    // does).
    // Just ignore the critical dependencies warning you see.
    new webpack.ContextReplacementPlugin(/canjs/, /^$/)
  ],
  module: {
    loaders: [{test: /\.js$/, loader: "destealify"}]
  }
};
