'use strict';

const gulp = require('gulp');
const lp = require('gulp-load-plugins')(); // ленивая загрузка плагинов по маске

const path = require('path');
const del = require('del'); // удаление директорий, файлов
const combiner = require('stream-combiner2').obj; // объединение цепочки плагинов

/*
 const stylus = require('gulp-stylus');
 const concat = require('gulp-concat'); // объединение файлов
 const gulpIf = require('gulp-if'); // условия
 const sourcemaps = require('gulp-sourcemaps'); // создание sourcemap
 const babel = require('gulp-babel');
 const newer = require('gulp-newer');
 const imagemin = require('gulp-imagemin'); // минификация изоюражений
 const autoprefixer = require('gulp-autoprefixer');
 const remember = require('gulp-remember');
 const cached = require('gulp-cached');
 const notify = require('gulp-notify'); // всплывающие оповещения
 const cssnano = require('gulp-cssnano'); // сжатие css
 const base64 = require('gulp-base64'); // некоторые изображения в css в виде base64
 const uglify = require('gulp-uglify'); // сжатие javascript
 const rev = require('gulp-rev'); // ревизии обработанных файлов
 */

const input = {
	js: 'local/dev/js/**/*.js',
	css: 'local/dev/css/**/*.styl',
	images: 'local/dev/i/**/*.{png,jpg,jpeg,svg}'
	// files: 'local/dev/files'
};
const output = {
	js: 'js',
	css: 'css',
	images: 'i'
	// files: 'files'
};

const MANIFEST = 'manifest';

const isDevelopment = (
		!process.env.NODE_ENV
		|| process.env.NODE_ENV == 'dev'
		|| process.env.NODE_ENV == 'development'
);

// Browser definitions for autoprefixer
const AUTOPREFIXER_BROWSERS = [
	'last 2 versions',
	'ie >= 9',
	'ios >= 7',
	'android >= 4.4',
	'bb >= 10'
];

// -------------------------------- image --------------------------------
gulp.task('image', function () {
	let task_name = 'image';
	return combiner(
			gulp.src(input.images, {since: gulp.lastRun(task_name)}),
			lp.cached(task_name),
			lp.newer(output.images),
			/*lp.if(function (file) {
			 let extensions = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
			 for (let i = 0, len = extensions.length; i < len; i++) {
			 if (file.extname == '.' + extensions[i]) {
			 return true;
			 }
			 }
			 return false;
			 }, lp.imagemin()),*/
			lp.imagemin(),
			gulp.dest(output.images)
	);
});
// -------------------------------- image --------------------------------


// ------------------------------ javascript -----------------------------
gulp.task('js', function () {
	let task_name = 'js';
	return gulp.src(input.js, {since: gulp.lastRun(task_name)})
			.pipe(lp.if(isDevelopment, lp.sourcemaps.init()))
			.pipe(lp.cached(task_name))
			.pipe(lp.newer(output.js))
			.pipe(lp.babel({
				presets: ['es2015']
			}).on('error', lp.notify.onError(function (err) {
				return {
					title: 'BabelJS',
					message: err.message
				};
			})))
			.pipe(lp.if(isDevelopment, lp.sourcemaps.write()))
			.pipe(lp.if(!isDevelopment, combiner(
					lp.uglify(),
					lp.rev()
			)))
			.pipe(gulp.dest(output.js))
			.pipe(lp.if(!isDevelopment, combiner(
					lp.rev.manifest('js.json'),
					gulp.dest(MANIFEST)
			)));
});
// ------------------------------ javascript -----------------------------


// --------------------------------- css ---------------------------------
gulp.task('css', function () {
	let task_name = 'css';
	let resolver = require('stylus').resolver;
	return gulp.src('local/dev/css/**/styles.styl')
			.pipe(lp.cached(task_name))
			.pipe(lp.if(isDevelopment, lp.sourcemaps.init()))
			.pipe(lp.stylus({
				define: {
					import: process.cwd() + input.images,
					url: resolver()
				}
			})).on('error', lp.notify.onError(function (err) {
				return {
					title: 'Stylus',
					message: err.message
				};
			}))
			.pipe(lp.base64({
				/*baseDir: 'public',
				 exclude:    [/\.server\.(com|net)\/dynamic\//, '--live.jpg'],
				 debug: true,*/
				extensions: ['svg', 'png', /\.jpg#datauri$/i],
				maxImageSize: 4 * 1024 // bytes

			}))
			.pipe(lp.autoprefixer(AUTOPREFIXER_BROWSERS))
			.pipe(lp.remember(task_name))
			.pipe(lp.concat('styles.css'))
			.pipe(lp.if(isDevelopment, lp.sourcemaps.write()))
			.pipe(lp.if(!isDevelopment, combiner(
					lp.cssnano(),
					lp.rev()
			)))
			.pipe(gulp.dest(output.css))
			.pipe(lp.if(!isDevelopment, combiner(
					lp.rev.manifest('css.json'),
					gulp.dest(MANIFEST)
			)));
});
// --------------------------------- css ---------------------------------


// -------------------------------- files --------------------------------
/*gulp.task('files', function () {
 let task_name = 'files';
 return combiner(
 gulp.src(input.files, {since: gulp.lastRun(task_name)}),
 lp.newer(output.files),
 gulp.dest(output.files)
 );
 });*/
// -------------------------------- files --------------------------------

// -------------------------------- clean --------------------------------
gulp.task('clean:js', function () {
	return del(output.js);
});

gulp.task('clean:css', function () {
	return del(output.css);
});

gulp.task('clean:image', function () {
	return del(output.images);
});
gulp.task('clean',
		gulp.parallel('clean:js', 'clean:css', 'clean:image')
);
// -------------------------------- clean --------------------------------


// ------------------------------- watchers ------------------------------
gulp.task('watch', function () {
	gulp.watch(input.images, gulp.series('image'));
	gulp.watch(input.css, gulp.series('css'))/*.on('unlink', function (filepath) {
		lp.remember.forget('css', path.resolve(filepath));
		delete lp.cached.caches.styles[path.resolve(filepath)];
	})*/;
	gulp.watch(input.js, gulp.series('js')).on('unlink', function (filepath) {
		lp.remember.forget('js', path.resolve(filepath));
		delete lp.cached.caches.js[path.resolve(filepath)];
	});
	//gulp.watch(input.files, gulp.series(['files']));
});
// ------------------------------- watchers ------------------------------


gulp.task('build',
		gulp.series(
				'clean',
				gulp.parallel('js', gulp.series('css', 'image'))
		)
);


gulp.task('dev',
		gulp.series('build', 'watch')
);


gulp.task('default',
		gulp.series('dev')
);

/*
 gulp.task('default', function () {
 return gulp.src('local/dev/i/!**', {since: gulp.lastRun('image')})
 .pipe(lp.cached('image'))
 .pipe(lp.newer('i'))
 .pipe(lp.If(function (file) {
 return file.extname == '.jpg' || file.extname == '.jpeg' || file.extname == '.png' || file.extname == '.gif';
 }, lp.imagemin()))
 .pipe(gulp.dest('i'));
 });*/
