// vue.config.js
module.exports = {
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = 'Little Alchemy'
                args[0].description = 'Merge items to find new items.'
                return args
            })
    }
}