const gulp = require('gulp');
const rev = require('gulp-rev-zhj');
const revCollector = require('gulp-rev-collector-zhj');
const runSequence = require('run-sequence');
const clean = require('gulp-clean');
const minifycss = require('gulp-minify-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const notify = require('gulp-notify');
const tinypng_nokey = require('gulp-tinypng-nokey');
const connect = require('gulp-connect');
const babel = require("gulp-babel");

// CSS处理
gulp.task('minifyCss', function () {
    return gulp.src('./src/style/*.css')
        .pipe(concat('all.css'))
        .pipe(gulp.dest('./src/css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('./src/css'))
        .pipe(notify({
            message: 'minifyCss task ok'
        }))
});

gulp.task('es5', function() {
    return gulp.src('./src/script/*.js')
    .pipe(babel())
    .pipe(gulp.dest('./src/es5'))
    .pipe(notify({
        message: "es5 task ok"
    }))
});

// JS处理
gulp.task('minifyJs', function () {
    return gulp.src('./src/script/*.js')
        .pipe(babel())
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./src/js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./src/js'))
        .pipe(notify({
            message: "minifyJs task ok"
        }))
});

// 图片压缩
gulp.task('tinyPng', function () {
    gulp.src('./src/images/*.{png,jpg,jpeg,gif,ico}')
        .pipe(tinypng_nokey())
        .pipe(gulp.dest('./dist/images'));
})

// 指定CSS文件添加MD5
gulp.task('cssRev', function () {
    return gulp.src('./src/css/all.min.css')
        .pipe(rev())
        .pipe(gulp.dest('./dist/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/css'))
        .pipe(notify({
            message: "cssRev task ok"
        }))
});

// 指定JS文件添加MD5
gulp.task('jsRev', function () {
    return gulp.src('./src/js/all.min.js')
        .pipe(rev())
        .pipe(gulp.dest('./dist/js'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/js'))
        .pipe(notify({
            message: "jsRev task ok"
        }))
});

// html路径替换
gulp.task('htmlRev', function () {
    return gulp.src(['./rev/**/*.json', './src/*.html'])
        .pipe(revCollector({
            replaceReved: true, //允许替换, 已经被替换过的文件
            /* dirReplacements: {
                'css': '/dist/css',
                'js': '/dist/js'
            } */
        }))
        .pipe(gulp.dest('./dist'))
        .pipe(notify({
            message: "htmlRev task ok"
        }))
});

// 清理文件
gulp.task('cleanRev', function () {
    return gulp.src(['dist', 'rev'])
        .pipe(clean());
});

gulp.task('clean', function () {
    return gulp.src(['./src/css/*.css', './src/js/*.js'])
        .pipe(clean());
});

// 复制文件
gulp.task('copy', function () {
    return gulp.src('./src/lib/*')
        .pipe(gulp.dest('./dist/lib'))
});

// 监测文件变化
gulp.task('watch', function () {
    gulp.watch('./src/style/*.css', ['minifyCss']);
    gulp.watch('./src/script/*.js', ['minifyJs']);
    gulp.watch("./src/**/*.*", ["reload"]); //监听src下所有文件
})

// 开启node本地服务
gulp.task('webServer', function () {
    connect.server({
        root: 'src',
        livereload: true,
        port: 5000,
        host: '0.0.0.0'
    });
});

// 刷新
gulp.task("reload", function(){
	gulp.src("./src/*.html")
		.pipe(connect.reload());
})

// 开发环境
gulp.task('dev', function (cb) {
    runSequence('clean', ['minifyJs', 'minifyCss', 'webServer'], 'watch', cb)
});

// 生产环境
gulp.task('build', function (cb) {
    runSequence('cleanRev', ['copy', 'tinyPng', 'cssRev', 'jsRev'], 'htmlRev', cb)
});