const gulp = require('gulp'),
  sass = require('gulp-sass'),
  pug = require('gulp-pug'),
  sourcemaps = require('gulp-sourcemaps'),
  browserSync = require('browser-sync'),
  uglify = require('gulp-uglifyjs'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  del = require('del'),
  plumber 		 = require('gulp-plumber'),
  notify 			 = require('gulp-notify'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  cache = require('gulp-cache'),
  svgmin 			 = require('gulp-svgmin'),
  svgstore = require('gulp-svgstore'),
  babel 			 = require('gulp-babel'),
  ext_replace = require('gulp-ext-replace'),
  autoprefixer = require('gulp-autoprefixer');

// compile our scss
gulp.task('scss', () => gulp.src('app/scss/**/*.scss')
  .pipe(sourcemaps.init())
  .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
  .pipe(sass())
  .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
  .pipe(sourcemaps.write('app.css'))
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.reload({ stream: true })));

// scss minify
gulp.task('scss-manify', () => gulp.src('app/scss/**/*.scss')
  .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
  .pipe(sass())
  .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
  .pipe(cssnano())
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest('app/css'))
  .pipe(browserSync.reload({ stream: true })));

// compile es6 to es5 with babel and minify
gulp.task('es6', () => gulp.src('app/js/common.es6.js')
  .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
  .pipe(babel({
    presets: ['es2015'],
  }))
  .pipe(ext_replace('.js', '.es6.js'))
  .pipe(rename({ suffix: '.es5' }))
  .pipe(uglify())
  .pipe(gulp.dest('app/js')));


// make img size smaller
gulp.task('img', () => gulp.src('app/img/**/*')
  .pipe(cache(imagemin({
    interlaced: true,
    progressive: true,
    svgoPlugins: [{ removeViewBox: false }],
    use: [pngquant()],
  })))
  .pipe(gulp.dest('dist/img')));

// watch for changings
gulp.task('browser-sync', () => {
  browserSync({
    server: {
      baseDir: 'app',
    },
    notify: false,
  });
});

// watch taks
gulp.task('watch', ['browser-sync', 'scss', 'scss-manify', 'es6'], () => {
  gulp.watch('app/scss/**/*.scss', ['scss']);
  gulp.watch('app/scss/**/*.scss', ['scss-manify']);
  gulp.watch('app/js/common.es6.js', ['es6']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

// delete our old production folder
gulp.task('clean', () => del.sync('dist'));
gulp.task('clear', () => cache.clearAll());

/* build production */
gulp.task('build', ['clean', 'img', 'scss', 'scss-manify'], () => {
  gulp.src([
    'app/css/template_styles.css',
    'app/css/template_styles_tablet.css',
    'app/css/template_styles_desktop.css',
    'app/css/template_styles.min.css',
    'app/css/template_styles_tablet.min.css',
    'app/css/template_styles_desktop.min.css',
  ])
    .pipe(gulp.dest('dist/css'));

  gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'));

  gulp.src('app/js/**/*')
    .pipe(gulp.dest('dist/js'));

  gulp.src('app/*.html')
    .pipe(gulp.dest('dist'));

  gulp.src('app/libs/**')
    .pipe(gulp.dest('dist/libs/'));
});

/* default task */
gulp.task('default', ['watch', 'es6']);


// usefull tasks
gulp.task('del-min', () => gulp.src('app/optimized/**')
  .pipe(ext_replace('.jpg', '-min.jpg'))
  .pipe(gulp.dest('app/without')));
gulp.task('svgstore', () => gulp.src('app/img/svg/*.svg')
  .pipe(svgmin())
  .pipe(svgstore())
  .pipe(rename({ basename: 'sprite' }))
  .pipe(gulp.dest('./app/img/')));
