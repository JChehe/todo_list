var gulp = require("gulp");

var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var minifyCss = require("gulp-minify-css");
//var jshint = require("gulp-jshint");
var concat = require("gulp-concat");
var imagemin = require("gulp-imagemin");
var pngquant = require("imagemin-pngquant");
var notify = require("gulp-notify");
var cache = require("gulp-cache");
var livereload = require("gulp-livereload");
var gutil = require('gulp-util');

gulp.task("say", function() {
    console.log("Hello World！");
});

// 处理样式：压缩CSS
gulp.task("style", function() {
    return gulp.src(["public/src/styles/**/*.css"])
        .pipe(gulp.dest("public/dist/css/"))
        .pipe(minifyCss())
        .pipe(rename({ suffix: ".min" }))
        .pipe(gulp.dest("public/dist/css/"))
});


// 处理JS：jshint 检查、压缩JS
gulp.task("script", function() {
    return gulp.src(["public/src/scripts/**/*.js"])
        .pipe(gulp.dest("public/dist/js/"))
        .pipe(uglify()).on('error', gutil.log)
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest("public/dist/js/"))
});

// 处理图片：压缩图片
gulp.task("image", function() {
    return gulp.src(["public/src/images/**/*"])
        .pipe(cache(
            imagemin({
                progressive: true,
                svgoPlugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ],
                use: [pngquant()]
            })))
        .pipe(gulp.dest("public/dist/images/"))
});

// 清空 dist 的css/js/images
gulp.task("clean", function() {
    return gulp.src(["public/dist/js", "public/dist/css", "public/dist/images"], { read: false })
        .pipe(clean());
});



// 默认任务
gulp.task("default", function() {
    gulp.start("clean","style", "script", "image");
});

// 监听改动
gulp.task("watch", function() {
    gulp.watch(["public/src/styles/**/*.css"], ["style"]);
    gulp.watch(["public/src/scripts/**/*.js"], ["script"]);
    gulp.watch(["public/src/images/**/*"], ["image"]);

    livereload.listen();
    gulp.watch(["**/*.html", "public/dist/**/*"]).on("change", livereload.changed);
})
