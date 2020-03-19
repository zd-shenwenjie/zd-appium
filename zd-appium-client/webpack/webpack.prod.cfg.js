const merge = require('webpack-merge');
const baseConfig = require('./webpack.cfg');

console.log(__dirname);
module.exports = merge(baseConfig, {
    mode: 'production'
});
