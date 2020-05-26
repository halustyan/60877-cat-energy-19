"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var server = require("browser-sync").create();
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var htmlmin = require("gulp-htmlmin");
var uglify = require('gulp-uglify');
var del = require("del");
var clean = require('gulp-clean');

gulp.task('clean', function () {
  return gulp.src('source/less/*.css', {read: false})
      .pipe(clean());
});

gulp.task("copy", function () {
  return gulp
    .src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/**/*.webp",
      "source/js/*.min.js"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("clear", function () {
  return del("build");
});

gulp.task("html", function () {
  return gulp
    .src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest("build"));
});

gulp.task("css", function () {
  return gulp
    .src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(gulp.dest("build/css"))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("css2", function () {
  return gulp
    .src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
});


gulp.task("uglify", function () {
  return gulp
    .src(["source/js/*.js", "!*.min.js"])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest("build/js"))
});

gulp.task("images", function () {
  return gulp
    .src(["source/img/**/*.{jpg,png,svg}", "!sprite.svg"])

    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),

      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
  return gulp
    .src(["source/img/{icon-,logo-pink-}*.svg", "source/img/htmlacademy.svg"])
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite-auto.svg"))

    .pipe(gulp.dest("source/img"));

});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", /*gulp.series("css"),*/ server.reload);

  gulp.watch("source/*.html").on("change", server.reload);
});

gulp.task("build", gulp.series("clear", "copy", "images", "css", "css2", "uglify", "html", "clean"));

gulp.task("start", gulp.series("build", "server"));
