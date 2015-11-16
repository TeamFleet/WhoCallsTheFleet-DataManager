var fs = require('fs');
var path = require('path');

var dir = {
	'root':		'.'
};
dir.source	= path.join( dir.root, 'source' );
dir.output	= path.join( dir.root, 'app', 'assets' );

// Include gulp
var gulp = require('gulp'); 

// Include Plugins
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var LessPluginCleanCSS = require('less-plugin-clean-css');
var cleanCSSPlugin = new LessPluginCleanCSS({advanced: true});
var babel = require('gulp-babel');
var rename = require('gulp-rename');
var notify = require("gulp-notify");

function parseKoalaJS(){
	var filename = Array.prototype.pop.call(arguments);
	var dir = Array.prototype.join.call(arguments, '/');
	return fs.readFileSync( path.join( dir, filename ), 'utf-8')
				.replace(/\r?\n|\r/g, '')
				.split('// @koala-prepend ')
				.filter(function(value){
					return value
				})
				.map(function(value){
					if( value )
						return path.join(dir, value.replace(/^\"(.+)\"$/g, '$1') )
				});
};



gulp.task('js-base', function(){
	return gulp.src(parseKoalaJS( dir.source, 'js-base.js' ))
		.pipe(concat('js-base.js'))
		/*
		.pipe(babel({
			'highlightCode':	false,
			'comments':			false,
			'compact':			false,
			'ast':				false
		}))
		*/
		.pipe(uglify())
		.pipe(gulp.dest( dir.output ))
		.pipe(notify("[COMPLETE] <%= file.relative %>!"));
		/*
		.pipe(rename({ extname: '.min.js' }))
		.pipe(gulp.dest( dir.output ));
		*/
});

gulp.task('js-app-main', function(){
	return gulp.src(parseKoalaJS( dir.source, 'js-app-main.js' ))
		.pipe(concat('js-app-main.js'))
		//.pipe(uglify())
		.pipe(gulp.dest( dir.output ))
		.pipe(notify("[COMPLETE] <%= file.relative %>!"));
});

gulp.task('css-base', function(){
	return gulp.src( path.join( dir.source, 'css-base.less' ) )
		.pipe(less())
		.pipe(minifyCSS())
		//.pipe(postcss([
		//	autoprefixer()
		//]))
		.pipe(gulp.dest( dir.output ))
		.pipe(notify("[COMPLETE] <%= file.relative %>!"));
});

gulp.task('css-app-main', function(){
	return gulp.src( path.join( dir.source, 'css-app-main.less' ) )
		.pipe(less())
		//.pipe(less({
		//	'plugins':	[cleanCSSPlugin]
		//}))
		.pipe(postcss([
			autoprefixer({browsers: ['Chrome >= 41']})
		]))
		.pipe(minifyCSS({
			aggressiveMerging:	false
		}))
		.pipe(gulp.dest( dir.output ))
		.pipe(notify("[COMPLETE] <%= file.relative %>!"));
		/*
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest( path.join( rootOutput, 'assets-output' ) ));
		*/
});

gulp.task('watch', function(){
	gulp.watch(
			path.join( dir.source, '**/*.js' ),
			['js-base', 'js-app-main']
		);
	gulp.watch(
			path.join( dir.source, '**/*.less' ),
			['css-base', 'css-app-main']
		);
});

gulp.task('default',[
	'js-base',
	'js-app-main',
	'css-base',
	'css-app-main',
	'watch'
]);