// Gulpfile only for manual build in special cases. Normally not required
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const rimraf = require('rimraf');
const webpack = require('webpack');

const themeConfig = require('./packages/theme-ab/webpack.config');
const vendorConfig = require('./config/vendor.webpack.config.js');
const clientConfig = require('./config/client.webpack.config.js');
const gmailConfig = require('./@gmail/server/webpack.config.js');

const BUILD_DIR = path.join(__dirname, 'build');

/**
 * Выводит результаты сборки в консоль, выбрасывает исключение при ошибке.
 */
const onBuild = (cb) => (err, stats, options = {}) => {
    if (err) {
        throw new gutil.PluginError('webpack', err, {showStack: true});
    }
    options = Object.assign({
        chunkModules: false,
        errorDetails: false,
        hash: false,
        cached: false,
        cachedAssets: false,
        modules: false,
        reasons: false,
        version: false,
        warnings: false,
    }, options);

    gutil.log('webpack', stats.toString(options));

    // profile with graph tool https://github.com/webpack/webpack/issues/690
    if (process.env.PROFILE) {
        const json = stats.toJson();
        const profile = `${BUILD_DIR}/${stats.compilation.entries[0].name}-profile.json`;

        gutil.log(`Writing ${profile}`);
        fs.writeFileSync(profile, JSON.stringify(json));
    }
    if (typeof cb === 'function') {
        cb();
    }
};

gulp.task('clean', (cb) => rimraf('build/*', cb));

// Build vendor bundles build/assets/scripts/vendor.js and build/assets/styles.vendor.css
gulp.task('vendor', (cb) => webpack(vendorConfig, onBuild(cb)));

// Build client bundles
gulp.task('client', (cb) => webpack(clientConfig, onBuild(cb)));

// Build theme and copy resources
gulp.task('theme', (cb) => webpack(themeConfig, onBuild(cb)));

// Servers
gulp.task('gmail', () => webpack(gmailConfig, onBuild()));
gulp.task('servers', ['gmail']);

gulp.task('default', []);
