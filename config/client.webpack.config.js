const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
// const CompressionPlugin = require('zopfli-webpack-plugin');
const {recaptchaKey} = require('../config/server/config');

const __DEVELOPMENT__ = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const __PRODUCTION__ = process.env.NODE_ENV === 'production';

const baseDir = path.resolve(__dirname, '..');
const buildDir = path.resolve(baseDir, 'build');
const publicPath = '/assets/';

let config = {
    context: baseDir,
    target: 'web',
    profile: !!process.env.PROFILE,
    entry: {
        // video: [
        //     path.join(baseDir, '@video/index.js'),
        // ],
        gmail: [
            path.join(baseDir, '@gmail/index.js'),
        ],
        // teasers: [
        //     path.join(baseDir, '@teasers/index.js'),
        // ]
    },
    output: {
        publicPath,
        path: path.join(buildDir, publicPath),
        filename: 'scripts/[name].js',
        chunkFilename: 'scripts/[name]-[chunkhash].js',
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            include: baseDir,
            loader: 'babel-loader?cacheDirectory=true',
        }, {
            test: /\.(graphql|gql)$/,
            exclude: /node_modules/,
            loader: 'graphql-tag/loader',
        }, {
            test: /(\.png|\.jpg|\.jpeg|\.gif|\.svg)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    outputPath: 'img/',
                    name: '[name].[ext]',
                },
            }],
        },
            // CSS modules (see below)
        ],
    },
    resolve: {
        extensions: ['.js', '.json', '.less'],
        alias: {
            '@graphql': path.resolve(baseDir, '@graphql'),
            '@gmail': path.resolve(baseDir, '@gmail'),
            config: path.resolve(baseDir, 'config'),
            packages: path.resolve(baseDir, 'packages'),
        },
    },
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        lodash: '_',
        raven: 'Raven',
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DllReferencePlugin({
            context: '.',
            manifest: 'build/vendor-manifest.json',
        }),
        new webpack.DefinePlugin({
            'process.env': {
                BUILD_TARGET: JSON.stringify('client'),
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
            },
            __DEVELOPMENT__: JSON.stringify(__DEVELOPMENT__),
            __PRODUCTION__: JSON.stringify(__PRODUCTION__),
            __RECAPTCA_KEY__: JSON.stringify(recaptchaKey),
            __NODE__: 'false',
            __BROWSER__: 'true',
            __TESTS__: 'false',
        }),
    ],
};

// CSS modules
const lessLoader = [{
    loader: 'css-loader',
    options: {
        module: true,
        localIdentName: '[name]--[local]--[hash:base64:8]',
    },
}, {
    loader: 'less-loader',
    options: {
        plugins: [new LessPluginAutoPrefix({
            browsers: [
                'last 2 versions',
                'iOS >= 8',
                'Safari >= 8']
        })],
    },
}];

if (__PRODUCTION__) {
    config.module.rules.push({
        test: /\.less$/,
        use: ExtractTextPlugin.extract({allChunks: true, use: lessLoader}),
    }, {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({allChunks: true, use: 'css-loader'}),
    });
    config.plugins = [
        ...config.plugins,
        new ExtractTextPlugin('styles/[name].css'),
        new OptimizeCssAssetsPlugin(),
    ];
} else {
    config.module.rules.push({
        test: /\.less$/,
        use: [
            {loader: 'style-loader'},
            ...lessLoader,
        ],
    }, {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
    });
}

// HMR
if (__DEVELOPMENT__) {
    // config.entry.video.unshift('react-hot-loader/patch');
    config.entry.gmail.unshift('react-hot-loader/patch');
    // config.entry.teasers.unshift('react-hot-loader/patch');
    config.plugins = [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.SourceMapDevToolPlugin({
            include: /\.jsx?$/,
        }),
        ...config.plugins,
    ];
    config.devServer = {
        publicPath,
        contentBase: buildDir,
        host: '0.0.0.0',
        port: 3000,
        public: '0.0.0.0/sockjs-client',
        disableHostCheck: true,
        historyApiFallback: true,
        hotOnly: true,
        compress: true,
    };
}

// Mangler
if (__PRODUCTION__) {
    config.plugins = [
        ...config.plugins,
        new webpack.optimize.UglifyJsPlugin(),
        // new CompressionPlugin({
        //     asset: '[path].gz',
        // }),
    ];
}

module.exports = config;
