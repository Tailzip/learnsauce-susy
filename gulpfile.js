"use strict";

var gulp = require('gulp');

// Load plugins
var 	$ 	= require('gulp-load-plugins')(),
	server 	= require('tiny-lr')();

// Setup paths
var paths = {
	app  : './src',
	dest : './dist',
	extras : ['favicon.ico', 'robots.txt'],
};

gulp.task('styles', function(){
	return gulp.src([
		paths.app + '/assets/scss/**/*.scss',
			'!' + paths.app + '/assets/scss/**/_*.scss'
		])
		.pipe($.compass({
			config_file: './config.rb',
			css: paths.app + '/assets/css',
            		sass: paths.app + '/assets/scss'
		}))
		.pipe($.autoprefixer('last 2 version'))
		.pipe(gulp.dest( paths.app + '/assets/css'))
		.pipe($.livereload(server))
		.pipe($.rename({suffix: '.min'}))
		.pipe($.minifyCss())
		.pipe(gulp.dest( paths.dest + '/assets/css'))
		.pipe($.notify({ message: 'Styles task complete!' }));
});

gulp.task('coffee', function(){
	return gulp.src(paths.app + '/assets/js/**/*.coffee')
		.pipe($.coffeelint())
		.pipe($.coffee({bare: true}))
		.pipe($.livereload(server))
		.pipe(gulp.dest( paths.app + '/assets/js'));
});

gulp.task('lintscripts', ['coffee'], function(){
	return gulp.src([
			'!gulpfile.js',
			'!' + paths.app + '/assets/js/app.js',
			'!' + paths.app + '/assets/js/vendor/*',
			paths.app + '/assets/js/**/*.js'
		])
		.pipe($.jshint('.jshintrc'))
		.pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['coffee' , 'lintscripts'], function(){
	return gulp.src([
			// setup script sequence
			paths.app + '/assets/js/vendor/jquery.js',
			paths.app + '/assets/js/plugins.js',
			paths.app + '/assets/js/prism.js',
			paths.app + '/assets/js/fittext.js',
			paths.app + '/assets/js/main.js'
		])
		.pipe($.concat('app.js'))
		.pipe(gulp.dest( paths.app + '/assets/js'))
		.pipe($.livereload(server))
		.pipe($.uglify())
		.pipe($.rename({suffix: '.min'}))
		.pipe(gulp.dest( paths.dest + '/assets/js'))
		.pipe($.notify({ message: 'Scripts task complete!' }));
});

gulp.task('images', function(){
	return gulp.src([
			paths.app + '/assets/img/**/*.png',
			paths.app + '/assets/img/**/*.jpg',
			paths.app + '/assets/img/**/*.gif'
		])
		.pipe($.cache($.imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
		.pipe($.livereload(server))
		.pipe(gulp.dest( paths.dest + '/assets/img'))
		.pipe($.notify({ message: 'Images task complete!' }));
});

gulp.task('jade', function(){
	return gulp.src(paths.app + '/assets/**/*.jade')
		.pipe($.jade({
			pretty: true
		}))
		.pipe(gulp.dest(paths.app));
});

gulp.task('markup', [ 'jade' ] , function(){
	return gulp.src(paths.app + '/**/*.html')
		.pipe($.htmlReplace({
			'styles': 'assets/css/app.min.css',
			'scripts': 'assets/js/app.min.js'
		}))
		.pipe($.htmlPrettify({
			indent_char: '	', indent_size: 1
		}))
		.pipe($.livereload(server))
		.pipe(gulp.dest(paths.dest))
		.pipe($.notify({ message: 'Markup task complete!' }));
});

// Cleanup Tasks
gulp.task('clean', function(){
	return gulp.src( paths.dest + '/' , {read: false})
		.pipe($.clean());
});

// Copy Tasks
gulp.task('copy-extras', function() {
	return gulp.src(paths.app + '/' + paths.extras)
		.pipe(gulp.dest(paths.dest));
});

gulp.task('copy-fonts', function() {
	return gulp.src([
			paths.app + '/assets/fonts/**/*.ttf',
			paths.app + '/assets/fonts/**/*.svg',
			paths.app + '/assets/fonts/**/*.eot',
			paths.app + '/assets/fonts/**/*.woff'
		])
		.pipe(gulp.dest(paths.dest + '/assets/fonts'));
});

gulp.task('copy', function(){
	gulp.start('copy-fonts', 'copy-extras');
});

gulp.task('default', ['clean', 'copy'] , function(){
	gulp.start('markup', 'styles', 'scripts', 'images');
});

gulp.task('zip', function () {
    gulp.src(paths.dest + '/**/*')
        .pipe($.zip('bundle.zip'))
        .pipe(gulp.dest('./'));
});

gulp.task('serve', function() {

	server.listen(35729, function (err) {

		if (err) return console.log(err);

		// Watch html files
		gulp.watch(paths.app + '/**/*.html', ['markup']);

		// Watch .scss files
		gulp.watch([
				paths.app + '/assets/scss/**/*.scss',
				paths.app + '/assets/css/**/*.css',
			], ['styles']);

		// Watch .js files
		gulp.watch([
				paths.app + '/assets/js/**/*.js',
				paths.app + '/assets/js/**/*.coffee',
			], ['scripts']);

		// Watch images
		gulp.watch(paths.app + '/assets/img/**/*', ['images']);

	});

});