import gulp from 'gulp';
import babel from 'gulp-babel';
import autoprefixer from 'gulp-autoprefixer';
import cleanCss from 'gulp-clean-css';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import replace from 'gulp-replace';
import sass from 'gulp-sass';
import uglify from 'gulp-uglify';
import * as dartSass from 'sass';
import stylelint from 'gulp-stylelint';

const sassCompiler = sass(dartSass);

/**
 * Asset paths.
 */
const srcSCSS = 'scss/**/*.scss';
const srcJS = 'js/**/*.js';
const assetsDir = '../assets/';

/**
 * SCSS task
 */
gulp.task('scss', () => {
  return gulp.src('scss/*.scss.liquid')
    .pipe(sassCompiler({ outputStyle: 'expanded' }).on('error', sassCompiler.logError))
    .pipe(rename((path) => {
      path.basename = path.basename.replace('.scss', '.css');
      path.extname = '.liquid';
    }))
    .pipe(replace('"{{', '{{'))
    .pipe(replace('}}"', '}}'))
    .pipe(cleanCss())
    .pipe(gulp.dest(assetsDir));
});

/**
 * JS task
 */
const jsFiles = [
  './node_modules/babel-polyfill/dist/polyfill.js',
  srcJS,
];

gulp.task('js', () => {
  return gulp.src(jsFiles)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('dist.js'))
    .pipe(uglify())
    .pipe(gulp.dest(assetsDir));
});

/**
 * Images task
 */
gulp.task('images', () => {
  return gulp.src('images/**')
    .pipe(gulp.dest(assetsDir));
});

/**
 * Fonts task
 */
gulp.task('fonts', () => {
  return gulp.src('fonts/**')
    .pipe(gulp.dest(assetsDir));
});

/**
 * Watch task
 */
gulp.task('watch', () => {
  gulp.watch(srcSCSS, gulp.series('scss')).on('change', (path) => {
    console.log(`File ${path} was changed, running scss task...`);
  });
  gulp.watch(srcJS, gulp.series('js')).on('change', (path) => {
    console.log(`File ${path} was changed, running js task...`);
  });
  gulp.watch('images/**', gulp.series('images')).on('change', (path) => {
    console.log(`File ${path} was changed, running images task...`);
  });
  gulp.watch('fonts/**', gulp.series('fonts')).on('change', (path) => {
    console.log(`File ${path} was changed, running fonts task...`);
  });
});

/**
 * Default task
 */
gulp.task('default', gulp.series(gulp.parallel('scss', 'js', 'images', 'fonts', 'watch')));

/**
 * Lint task
 */
gulp.task('lint', () => {
  return gulp.src(srcSCSS)
    .pipe(stylelint({
      reporters: [
        { formatter: 'string', console: true }
      ],
      failAfterError: false
    }));
});
