"use strict"; // Не ппонял, для чего эта строка

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var server = require("browser-sync").create(); // Команда запуска локального сервера

var sass = require("gulp-less");
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

// Задача копирования файлов и папок в папку build
gulp.task("copy", function () {
  return gulp
    .src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/**/*.webp",  // картинки остальных форматов положу при оптимизации
      "source/js/*.min.js"     // копирую только минифицированые js-файлы
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

// Задача очистки папки build
gulp.task("clear", function () {
  return del("build");
});

gulp.task("html", function () {
  return gulp
    .src("source/*.html")
    .pipe(posthtml([
      include()      // добавляю возможность в html использовать тег-директиву <include src="file.*"></include>
    ]))
    .pipe(htmlmin({  // минифицирую html-файл
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(gulp.dest("build"));
});

// задача компиляции файла style.scss в файл style.min.css
gulp.task("css", function () {
  return gulp
    .src("source/less/style.less") // Найти файл style.scss
    .pipe(plumber())               // Проверяет корректность написанного кода и в консоли показывает ошибк
    .pipe(sourcemap.init())        // Иницизирует работу карты кода, фиксируя состояние препроцессорного кода
    .pipe(sass())                  // Компилирует sass-файлы в css-файл
    .pipe(postcss([                // Своего рода парссер css-кода со своими методами и функциями
      autoprefixer()               // Добавляет префиксы в css-файл
    ]))
    .pipe(csso())                  // Минифицирует css-файл
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))    // В конечном состоянии css-файла происходит перелиновка связей с scss
    .pipe(gulp.dest("build/css"))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
});

// Задача минимизации js
gulp.task("uglify", function () {
  return gulp
    .src(["source/js/*.js", "!*.min.js"]) // выбираю не минифицированные файлы js
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest("build/js")) // Поместить результируюий css-файл в указанную папку
});

// Задача оптимизации изображений
gulp.task("images", function () {
  return gulp
    .src(["source/img/**/*.{jpg,png,svg}", "!sprite.svg"]) // ищу изображения.
                            // sprite.svg исключаю, т.к. ранее собрал его вручную
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}), // оптимизируем png
      // оптимизируем jpeg.
      //imagemin.jpegtran({progressive: true}),   // --- не сработал
      imagemin.mozjpeg({
        quality: 75,
        progressive: true           //{progressive: true} - покажет сразу все фото, но мЫло.
      }),
      imagemin.svgo()               // оптимизируем svg
    ]))
    .pipe(gulp.dest("build/img"));  // Результат кладем в соответствующую папку
});

// Задача сборки svg-спрайтов
// SVG-спрайт ранее собрал вручную, но задачу напишу, запускать не буду
gulp.task("sprite", function () {
  return gulp
    .src(["source/img/{icon-,logo-pink-}*.svg", "source/img/htmlacademy.svg"]) // Ищу нужные svg
    .pipe(svgstore({
      inlineSvg: true // Удаляем комментарии и иное в svg-коде
    }))
    .pipe(rename("sprite-auto.svg"))// Т.к. собранный ранее вручную спрайт положен в файл sprite.svg,
                                    // то этот спрайт положится в файл sprite-auto.svg
    .pipe(gulp.dest("source/img")); // Эту задачу буду запускать при необходимости вручную, поэтому
                                    // итоговый спрайт кладу в папку "source/img".
});

// Задача, описывающая работу сервера
gulp.task("server", function () {
  server.init({        // Инициализация сервера
    server: "build/", // Папка, в которой лежат папки и файлы проекта-сайта
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  // Сервер, следи в указанной папке за файлами, указанного типа,
  // и в случае изменений превращай их в css и сам перезапустись
  gulp.watch("source/less/**/*.less", gulp.series("css"), server.reload);

  // Сервер, следи в указанной папке за файлами-html, и, в случае изменений, сам перезагрузись
  gulp.watch("source/*.html").on("change", server.reload);
});

// Команда "build" Компилирует проект в папку "build"
gulp.task("build", gulp.series("clear", "copy", "images", "css", "uglify", "html"));

// Командой start запускаем сначала задачу "css", "html" и потом "server"
gulp.task("start", gulp.series("build", "server"));
