'use strict';
var extend = require('xtend');

var common = require('./webpack.common');


module.exports = extend(common, {
    entry: './lib/index',
    externals: {
        react: 'react',
        'react/addons': 'react/addons'
    },
    module: {
        loaders: common.loaders.concat([{
            test: /\.jsx?$/,
            loaders: ['jsx-loader?harmony'],
            exclude: /node_modules/,
        }])
    }
});
