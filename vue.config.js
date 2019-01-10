const path = require('path')

module.exports = {
  chainWebpack: (config) => {
      var test = path.resolve(__dirname, 'test');
      var src = path.resolve(__dirname, 'src');
      var nodes = path.resolve(__dirname, 'node_modules');
      // config.devtool('eval')
      // config.module
      //   .rule('istanbul')
      //     .test(/\.(js|vue)$/)
      //     .enforce('post')
      //     .include.add(test).add(src)
      //     .end()
      //     .exclude.add(nodes)
      //     .end()
      //     .use('istanbul-instrumenter-loader')
      //       .loader('istanbul-instrumenter-loader')
      //       .options({ produceSourceMap: true, esModules: true });

    // const path = require('path')

    if (process.env.NODE_ENV !== 'production') {
      config.devtool('eval')
      config.module
        .rule('istanbul')
          .test(/\.(js|vue)$/)
          .enforce('post')
          .include
            .add(test).add(src)
            .end()
          .exclude
            .add(nodes)
            .end()
          .use('istanbul-instrumenter-loader')
            .loader('istanbul-instrumenter-loader')
            .options({ esModules: true })
    }
  }
}
