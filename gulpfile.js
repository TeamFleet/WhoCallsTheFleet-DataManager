"use strict";

const fs = require('fs');
const path = require('path');

const dirSource = './source';
const dirOutput = './app/assets';




/*
 * INCLUDE
 */

// Include gulp
const gulp = require('gulp');

// Include Plugins
const concat = require('gulp-concat');
// const uglify = require('gulp-uglify');
const less = require('gulp-less');
const nano = require('gulp-cssnano');
//const postcss = require('gulp-postcss');
//const autoprefixer = require('autoprefixer');
// const babel = require('gulp-babel');
const rename = require('gulp-rename');
const watchLess = require('gulp-watch-less2');
// const notify = require("gulp-notify");
const ngAnnotate = require('gulp-ng-annotate');

// Defaults ===================================================================

const terserOptions = {
    mangle: false,
    keep_classnames: true,
    keep_fnames: true,
}

// Tasks ======================================================================

const scripts = {
    base: () => 
        gulp.src(parseKoalaJS(dirSource, 'js-base.js'))
            .pipe(concat('js-base.js'))
            /*
            .pipe(babel({
                'highlightCode':	false,
                'comments':			false,
                'compact':			false,
                'ast':				false
            }))
            */
            // .pipe(uglify())
            .pipe(gulp.dest(dirOutput)),
    appMain: () => 
        gulp.src(parseKoalaJS(dirSource, 'js-app-main.js'))
            .pipe(concat('js-app-main.js'))
            //.pipe(uglify())
            .pipe(gulp.dest(dirOutput)),
    appAngular: () =>
        gulp.src(parseKoalaJS(dirSource, 'js-app-angular.js'))
            .pipe(concat('js-app-angular.js'))
            .pipe(ngAnnotate())
            .pipe(gulp.dest(dirOutput))
}
const styles = {
    app: () => {
        let f = path.join(dirSource, '*.less');
        return gulp.src(f)
            .pipe(watchLess(f, { verbose: true }, function (File) {
                lessCompile(File.history[0], dirOutput, {
                    nano: {
                        autoprefixer: {
                            'browsers': [
                                'Android >= 2',
                                'Chrome >= 20',
                                'Firefox >= 20',
                                'ie >= 11',
                                'Edge >= 12',
                                'iOS >= 5',
                                'ChromeAndroid >= 20',
                                'ExplorerMobile >= 11'
                            ],
                            add: true
                        }
                    }
                })
            }))
        /*
        return gulp.src( path.join( rootSource, 'css-app.less' ) )
            .pipe(less())
            //.pipe(less({
            //	'plugins':	[cleanCSSPlugin]
            //}))
            .pipe(postcss([
                autoprefixer({browsers: ['Chrome >= 41']})
            ]))
            .pipe(nano({
                //safe: 	true
            }))
            .pipe(gulp.dest( path.join( root, 'app', 'assets' ) ));
        */
    },
}

const allTasks = {
    scripts: Object.values(scripts),
    styles: Object.values(styles)
}

const build = gulp.parallel(
    ...Object.values(allTasks).map(tasks => gulp.parallel(...tasks))
)

exports.build = build

exports.watch = function () {
    gulp.watch(
        path.join(dirSource, '*js-!(angular)/**/*.js'),
        [scripts.base, scripts.appMain]
    );
    gulp.watch(
        path.join(dirSource, 'js-angular/**/*.js'),
        [scripts.appAngular]
    );
}

// Commons ====================================================================

function parseKoalaJS() {
    let filename = Array.prototype.pop.call(arguments);
    let dir = Array.prototype.join.call(arguments, '/');
    const r = fs.readFileSync(path.join(dir, filename), 'utf-8')
        .replace(/\r?\n|\r/g, '')
        .split('// @koala-prepend ')
        .filter(function (value) {
            return value
        })
        .map(function (value) {
            if (value)
                return path.join(dir, value.replace(/^"(.+)"$/g, '$1'))
        });
    return r
}

function lessCompile(file, outputPath, options) {
    options = options || {}

    function log() {
        console.log(`Compiled LESS ${file}`)
    }

    if (options.onlyMinify) {
        return gulp.src(file)
            .pipe(less())
            .pipe(nano(options.nano))
            .pipe(gulp.dest(outputPath))
            .on('end', log)
            .on('error', log);
    } else {
        return gulp.src(file)
            .pipe(less())
            .pipe(gulp.dest(outputPath))
            .pipe(nano(options.nano))
            .pipe(rename({ extname: '.min.css' }))
            .pipe(gulp.dest(outputPath))
            .on('end', log)
            .on('error', log);
    }
}

exports.default = build
