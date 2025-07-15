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
import { deleteAsync } from 'del';

const sassCompiler = sass(dartSass);

/**
 * Asset paths.
 */
const srcSCSS = 'scss/**/*.scss';
const srcJS = 'js/**/*.js';
const assetsDir = '../assets/';

/**
 * Clean tasks - löscht bestehende Dateien vor der Neukompilierung
 */
gulp.task('clean:css', async function() {
  return deleteAsync([
    `${assetsDir}dist.css.liquid`,
    `${assetsDir}*.css.liquid`
  ], { force: true });
});

/**
 * SCSS task
 */
gulp.task('scss', gulp.series('clean:css', function() {
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
}));

/**
 * Clean JS task - löscht bestehende JavaScript-Dateien vor der Neukompilierung
 */
gulp.task('clean:js', async function() {
  return deleteAsync([
    `${assetsDir}dist.js`,
    `${assetsDir}cart-drawer.js`,
    `${assetsDir}cart.js`,
    `${assetsDir}card-product.js`,
    `${assetsDir}infinite-scroll.js`,
    `${assetsDir}cart-icon-updater.js`,
    `${assetsDir}cart-redirect.js`,
    `${assetsDir}cart-state-manager.js`,
    `${assetsDir}auto-language-detection.js`,
    `${assetsDir}browser-navigation-cart-fix.js`,
    `${assetsDir}external-links.js`,
    `${assetsDir}unit-converter.js`,
    `${assetsDir}master-cart-system.js`,
    `${assetsDir}simple-cart.js`,
    `${assetsDir}product-form.js`,
    `${assetsDir}simple-add-to-cart.js`,

    `${assetsDir}back-button.js`,
    `${assetsDir}animations.js`
  ], { force: true });
});

/**
 * JS task - kompiliert dist.js aus allen Dateien
 */
const jsFiles = [
  './node_modules/babel-polyfill/dist/polyfill.js',
  './js/vendor/**/*.js',  // Vendor-Skripte zuerst laden (einschließlich MicroModal)
  srcJS,
  '!./js/animations.js',  // Animations.js ausschließen - wird separat geladen
  '!./js/browser-navigation-cart-fix.js',  // Browser-Navigation-Cart-Fix ausschließen - wird separat geladen
];

/**
 * JS dist task ohne clean (für parallele Ausführung)
 */
gulp.task('js:dist-only', () => {
  return gulp.src(jsFiles)
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('dist.js'))
    .pipe(uglify())
    .pipe(gulp.dest(assetsDir));
});

/**
 * Individual JS files task ohne clean (für parallele Ausführung)
 */
gulp.task('js:individual-only', () => {
  return gulp.src(['js/*.js', '!js/dist.js'])
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(gulp.dest(assetsDir));
});

/**
 * JS dist task mit clean
 */
gulp.task('js:dist', gulp.series('clean:js', 'js:dist-only'));

/**
 * Individual JS files task mit clean
 */
gulp.task('js:individual', gulp.series('clean:js', 'js:individual-only'));

/**
 * Combined JS task - beide Tasks laufen sequenziell nach clean:js
 */
gulp.task('js', gulp.series('clean:js', gulp.parallel('js:dist-only', 'js:individual-only')));

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
 * Build task - kompiliert alle Assets
 */
gulp.task('build', gulp.parallel('scss', 'js', 'images', 'fonts'));

/**
 * Default task
 */
gulp.task('default', gulp.series('build', 'watch'));

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
