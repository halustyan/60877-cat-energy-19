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
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var server = require("browser-sync").create();
var include = require ("posthtml-include");
var rename = require("gulp-rename");
var htmlmin = require('gulp-htmlmin');
var cssmin = require('gulp-cssmin');
var jsmin = require('gulp-jsmin');

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
    .pipe(csso())
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

/*gulp.task('minify', function() {
  return gulp.src('source/*.html')
  .pipe(htmlmin())
  .pipe(gulp.dest('build/'));
  });*/

gulp.task("images", function(){
  return gulp.src("source/img/**/*.{}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel:3})
  ]

  ))
  .pipe(gulp.dest("source/img"));
  });

  gulp.task("jsmin", async function () {
    gulp.src("source/js/**/*.js")
      .pipe(jsmin())
      .pipe(gulp.dest("build/js"))
      .pipe(server.stream());
  });


  gulp.task("webp", function (){
    return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
  });
  /*NEW*/


  gulp.task("sprite", function() {
    return gulp.src("source/img/icon-*.svg").pipe(svgstore({
      inlineSvg: true
    }))
   .pipe(rename("sprite.svg"))
      .pipe(gulp.dest("source/img"));
  });


  gulp.task('html', function() {
    return gulp.src(['source/**/*.html'])
      .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true
      }))
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

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build/"));

});


gulp.task("start", gulp.series("css", "server"));

gulp.task("build", gulp.series("css", "css2", "html", "jsmin", "sprite", "webp", "images", "copy", "server"));
