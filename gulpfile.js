const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const nunjucks = require('gulp-nunjucks');
const beautify = require('gulp-beautify');
const removeEmptyLines = require('gulp-remove-empty-lines');
const rename = require('gulp-rename');
const { config } = require('./config');

const style = () => {
    return gulp
        .src(config.src + 'css/style.css')
        .pipe(postcss())
        .pipe(gulp.dest(config.dist + 'css'))
}

const template = () => {
    delete require.cache[require.resolve(config.data)];
    return gulp.src([
            `${config.src}**/*.njk`,
            `!${config.src}_**/*.njk`,
        ])
        .pipe(nunjucks.compile({ 
            base_url: config.base_url, 
            ...require(config.data)
        }))
        .pipe(beautify.html({ 
            indent_size: 4, 
            end_with_newline: true,
        }))
        .pipe(rename(function (path) {
            path.extname = ".html"
        }))
        .pipe(removeEmptyLines())
        .pipe(gulp.dest(config.dist))
}

const browserSyncReload = (done) => {
    browserSync.reload();
    done();
}

const watch = () => {
    browserSync.init({
        server: {
            baseDir: [config.dist, config.static],
        }
    })
    gulp.watch(config.src + 'css/style.css', style);
    gulp.watch([`${config.src}**/*.njk`, config.data], gulp.series(style, template, browserSyncReload));
}

exports.watch = gulp.series(style, template, watch)
exports.build = gulp.series(style, template)