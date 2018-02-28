// Общий конфиг сборки для всех тем. Переопределяется в самих темах
const fs = require('fs');
const path = require('path');
const ncp = require('ncp');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');
// const CompressionPlugin = require('zopfli-webpack-plugin');
const WebpackOnBuildPlugin = require('on-build-webpack');

const __DEVELOPMENT__ = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const __PRODUCTION__ = process.env.NODE_ENV === 'production';

const baseDir = path.resolve(__dirname, '..');
const buildDir = path.resolve(baseDir, 'build');
const publicPath = '/assets/themes/';

/**
 * @param {string} themeName Theme name.
 * @param {boolean} [removeJsBundle] JS bundle must be removed (only css bundle has the meaning).
 * @param {string} [resourcesDir] Path (absolute). Content will be copied to the buildDir.
 * @param {Array} entry
 * @return {Object}
 */
module.exports = ({themeName, removeJsBundle = false, resourcesDir, entry = []}) => {
    let config = {
        context: baseDir,
        target: 'web',
        profile: !!process.env.PROFILE,
        entry: {
            theme: entry,
        },
        output: {
            publicPath,
            path: path.join(buildDir, publicPath),
            filename: `${themeName}/[name].js`,
            library: 'themeApi',
        },
        externals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            lodash: '_',
            'lodash/fp': 'lodash_fp',
        },
        resolve: {
            extensions: ['.js', '.json', '.less'],
            alias: {
                packages: path.resolve(baseDir, 'packages'),
            },
        },
        module: {
            rules: [{
                test: /\.jsx?$/,
                loader: 'babel-loader?cacheDirectory=true',
            }, {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: 'css-loader',
                }),
            }, {
                test: /(\.png|\.jpg|\.jpeg|\.gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        publicPath,
                        outputPath: `${themeName}/img/`,
                        name: '[name].[ext]',
                    },
                },
            }, {
                test: /(\.ttf|\.woff|\.woff2|\.eot|\.svg)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        publicPath,
                        outputPath: `${themeName}/fonts/`,
                        name: '[name].[ext]',
                    },
                },
            }],
        },
        plugins: [
            new ExtractTextPlugin(`${themeName}/[name].css`),
            new webpack.DllReferencePlugin({
                context: '.',
                manifest: 'build/vendor-manifest.json',
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
                },
                __DEVELOPMENT__: JSON.stringify(__DEVELOPMENT__),
                __PRODUCTION__: JSON.stringify(__PRODUCTION__),
            }),
            new WebpackOnBuildPlugin(() => {
                const outDir = path.join(buildDir, publicPath, themeName);

                if (removeJsBundle) {
                    const jsBundle = path.join(outDir, 'theme.js');
                    if (fs.existsSync(jsBundle)) {
                        fs.unlinkSync(jsBundle);
                    }
                    if (fs.existsSync(`${jsBundle}.map`)) {
                        fs.unlinkSync(`${jsBundle}.map`);
                    }
                }
                if (resourcesDir) {
                    ncp(resourcesDir, outDir);
                }
            }),
        ],
    };

    if (__PRODUCTION__) {
        // Mangler and compressor for production
        config.plugins = [
            ...config.plugins,
            new webpack.optimize.UglifyJsPlugin({sourceMap: true}),
            // new CompressionPlugin({
            //     asset: '[path].gz',
            // }),
        ];
    }

    return config;
};
