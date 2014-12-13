var gulp = require('gulp');
var gulpConcat = require('gulp-concat');
var gulpConnect = require('gulp-connect');
var gulpExec = require('gulp-exec');
var gulpHint = require('gulp-jshint');
var gulpMap = require('gulp-sourcemaps');
var gulpRename = require('gulp-rename');
var gulpSass = require('gulp-sass');
var gulpUglify = require('gulp-uglify');
var del = require('del');

var pkg = require('./package.json');

var DIST = 'dist/';
var VERSION_DIST = DIST+pkg.version+'/';
var CDN = 'cdn.rancher.io/api-ui';

gulp.task('default', ['build']);

gulp.task('build', ['js','css']);

gulp.task('clean', function() {
  return del([
    'tmp/**',
    'dist/**'
  ]);
});

gulp.task('server', ['build','livereload'], function() {
  return gulpConnect.server({
    root: [VERSION_DIST],
    port: process.env.PORT || 3000
  });
});

gulp.task('server:reload', function() {
  return gulpConnect.reload();
});

gulp.task('js', ['templates','partials'], function() {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'vendor/jquery.scrollintoview.js',
    'vendor/async.js',
    'vendor/json2.js',
    'vendor/polyfill.js',
    'vendor/JSONFormatter.js',
    'src/URLParse.js',
    'src/Cookie.js',
    'node_modules/handlebars/dist/handlebars.runtime.js',
    'src/template.js',
    'tmp/tpl/**',
    'src/HTMLApi.js',
    'src/Explorer.js',
    'src/init.js',
  ])
  .pipe(gulpMap.init())
    .pipe(gulpConcat('ui.js'))
    .pipe(gulp.dest(VERSION_DIST))
    .pipe(gulpUglify())
  .pipe(gulpMap.write('./'))
  .pipe(gulpRename({suffix: '.min'}))
  .pipe(gulp.dest(VERSION_DIST));
});

gulp.task('templates', function() {
  return gulp.src('templates/*.hbs', {read: false})
    .pipe(gulpExec('./node_modules/.bin/handlebars "<%= file.path %>"', {pipeStdout: true}))
    .pipe(gulpRename(function(path) {
      path.extname = '.hbs.js';
    }))
    .pipe(gulp.dest('./tmp/tpl'));
});

gulp.task('partials', function() {
  return gulp.src('partials/*.hbs', {read: false})
    .pipe(gulpExec('./node_modules/.bin/handlebars --partial "<%= file.path %>"', {pipeStdout: true}))
    .pipe(gulpRename(function(path) {
      path.extname = '.hbs.js';
    }))
    .pipe(gulp.dest('./tmp/tpl'));
});

gulp.task('css', function() {
  return gulp.src('styles/ui.scss')
    .pipe(gulpMap.init())
      .pipe(gulpSass())
    .pipe(gulpMap.write('./'))
    .pipe(gulp.dest(VERSION_DIST))
    .pipe(gulpRename({suffix: '.min'}))
    .pipe(gulp.dest(VERSION_DIST));
});

gulp.task('livereload', function() {
  gulp.watch('./gulpfile.js', ['server:reload']);
  gulp.watch('styles/**', ['css']);
  gulp.watch('src/**', ['js']);
  gulp.watch('templates/**', ['js']);
  gulp.watch('partials/**', ['js']);
})
