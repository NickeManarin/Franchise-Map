module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "/Franchise-Map/" : "/",

    chainWebpack: config => {
        config.module
            .rule('raw')
            .test(/\.csv$/)
            .use('raw-loader')
            .loader('raw-loader')
            .end()
    },

    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                win: {
                    target: 'portable'
                },
            }
        }
    }
}