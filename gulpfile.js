"use strict";

var gulp = require('gulp');
var connect = require('gulp-connect'); //Runs a local dev server
var open = require('gulp-open'); //Open a URL in a web browser
var less = require('gulp-less'); //less generator 
var concat = require('gulp-concat'); //Concatenates files
var lint = require('gulp-eslint'); //Lint JS files, including JSX

var config = {
    port: 3000,
    devBaseUrl: 'http://localhost',
    paths: {
        html: './src/*.html',
        js: './src/scripts/*.js',
        css: [
            'node_modules/normalize.css/normalize.css'
        ],
        less: './src/less/*.less',
        dist: './dist'
    }
}

//Start a local development server
gulp.task('connect', function () {
    connect.server({
        root: ['dist'],
        port: config.port,
        base: config.devBaseUrl,
        livereload: true
    });
});

gulp.task('connect-noreload', function () {
    connect.server({
        root: ['dist'],
        port: config.port,
        base: config.devBaseUrl,
        livereload: false
    });
});

gulp.task('open', ['connect'], function () {
    gulp.src('dist/index.html')
        .pipe(open({ uri: config.devBaseUrl + ':' + config.port + '/' }));
});

gulp.task('html', function () {
    gulp.src(config.paths.html)
        .pipe(gulp.dest(config.paths.dist))
        .pipe(connect.reload());
});

gulp.task('less', function () {
    return gulp.src(config.paths.less)
        .pipe(less())
        .pipe(gulp.dest(config.paths.dist + '/css'))
        .pipe(connect.reload());
});

gulp.task('js', function () {
    return gulp.src(config.paths.js)
        .pipe(gulp.dest(config.paths.dist + '/scripts'))
        .pipe(connect.reload());
})

gulp.task('lint', function () {
    return gulp.src(config.paths.js)
        .pipe(lint({ config: 'eslint.config.json' }))
        .pipe(lint.format());
});

gulp.task('watch', function () {
    gulp.watch(config.paths.html, ['html']);
    gulp.watch(config.paths.js, ['js','lint']);
    gulp.watch(config.paths.less, ['less']);
});

gulp.task('default', ['html', 'js', 'less', 'lint', 'open', 'watch']);
