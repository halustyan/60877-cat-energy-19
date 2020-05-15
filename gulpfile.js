"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var minify = require('gulp-minify');
var posthtml = require ('gulp-posthtml');
var include = require ("posthtml-include");
var csso = require("gulp-csso");
var webp = require("gulp-webp");
var posthtml = require("gulp-posthtml");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var server = require("browser-sync").create();
var include = require ("posthtml-include");
var rename = require("gulp-rename");
var htmlmin = require('gulp-htmlmin');

gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
});

gulp.task("css2", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});


gulp.task("images", function(){
  return gulp.src("source/img/**/*.{}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel:3})
  ]

  ))
  .pipe(gulp.dest("build/img"));
  });

  gulp.task("webp", function (){
    return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img"));
  });
  /*NEW*/
  gulp.task("copy", function () {
    return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/**"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build/"));

  });

  gulp.task("sprite", function() {
    return gulp.src("source/img/icon-*.svg").pipe(svgstore({
      inlineSvg: true
    }))
   .pipe(rename("sprite.svg"))
      .pipe(gulp.dest("source/img"));
  });


  gulp.task("html", function() {
  return gulp.src("source/*.html")
  .pipe(posthtml([
    include()
  ]))
  .pipe(gulp.dest("build"));
  });/*
  gulp.task('compress', function() {
    gulp.src('source/js/*.js')
      .pipe(minify({
          ext:{
              src:'-debug.js',
              min:'.js'
          },
          exclude: ['tasks'],
          ignoreFiles: ['.combo.js', '-min.js']
      }))
      .pipe(gulp.dest('build/js/'))
  });*/



gulp.task('minify', () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
});

  gulp.task('message', function(done) {
    console.log("HTTP Server Started");
    done();
  });

gulp.task("server", function () {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/*.html").on("change", server.reload);
});



gulp.task("start", gulp.series("css", "server"));

gulp.task("build", gulp.series("css", "css2", "html", "sprite", "webp", "images", "copy", "minify", "server"));
