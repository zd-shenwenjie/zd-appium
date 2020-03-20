const merge = require('webpack-merge');
const baseConfig = require('./webpack.cfg');

module.exports = merge(baseConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        port: 8000
    }
});