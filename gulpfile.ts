import gulp = require("gulp");
import del = require("del");
import tsc = require("gulp-typescript");
const tsProject = tsc.createProject("./tsconfig.json");
import tslint = require('gulp-tslint');


/**
 * Remove build directory.
 */
gulp.task('clean', () => {
    return del(["dist", "docs"]);
});
gulp.task("doc:dts", function () {
    let tsResult = gulp.src([
        "src/**/*.ts",
        "!src/kernel/app/gulpfile.ts",
        "!src/kernel/service/gulpfile.ts",
        "!src/kernel/ext/gulpfile.ts",
    ])
        .pipe(tsProject());
    return tsResult.dts
        .pipe(gulp.dest("docs"));
});
gulp.task('doc:clean', () => {
    return del(["docs"]);
});

gulp.task('doc', gulp.series('doc:clean', 'doc:dts'));

gulp.task("compile", () => {
    let tsResult = gulp.src([
        "src/**/*.ts",
        "!src/kernel/app/gulpfile.ts",
        "!src/kernel/service/gulpfile.ts",
        "!src/kernel/ext/gulpfile.ts",
    ])
        .pipe(tsProject());
    return tsResult.js
        .pipe(gulp.dest("dist/"));
});
gulp.task('make', () => {
    return gulp.src([
        "src/**/*.json",
        "!src/kernel/app/node_modules/**/*.json",
        "!src/kernel/service/node_modules/**/*.json",
        "!src/kernel/ext/node_modules/**/*.json",

    ])
        .pipe(gulp.dest('dist/'));
});
gulp.task('build:clean', () => {
    return del(["dist"]);
});
gulp.task('build', gulp.series('build:clean', gulp.parallel('compile', 'make')));

gulp.task('watch', () => {
    gulp.watch(["src/**/*.ts"], gulp.parallel('compile'));
    gulp.watch([
        "src/**/*.json",
        "!src/kernel/app/node_modules/**/*.json",
        "!src/kernel/service/node_modules/**/*.json",
        "!src/kernel/ext/node_modules/**/*.json",

    ], gulp.parallel('make'));

});
gulp.task('build:watch', gulp.series('build', 'watch'));

gulp.task("default", gulp.series('build', 'doc', 'watch'));

