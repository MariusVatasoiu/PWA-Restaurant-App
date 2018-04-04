var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');

var js = [
  'js/register_sw.js',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js'
];

gulp.task('default',['copy-html', 'copy-images', 'styles', 'scripts-dist'], function(){
  console.log('hello world');
});

gulp.task('watch', ['browserSync', 'styles', 'copy-html', 'scripts'], function(){
  gulp.watch('sass/**/*.scss', ['styles']);
  gulp.watch('/index.html', ['copy-html']);
  gulp.watch('*.html', browserSync.reload);
  gulp.watch('js/**/*.js', browserSync.reload);
});

gulp.task('dist', [
  'copy-html',
  'copy-images',
  'styles',
  'scripts-dist'
]);

gulp.task('scripts', function(){
  gulp.src(js)
      .pipe(babel({
        presets: ['env']
      }))
      .pipe(concat('all.js'))
      .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function(){
  gulp.src(js)
      .pipe(sourcemaps.init())
      .pipe(babel({
        presets: ['env']
      }))
      .pipe(concat('all.js'))
      .pipe(uglify().on('error', e => console.log(e)))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function(){
  gulp.src(['./*.html', './sw.js'])
      .pipe(gulp.dest('./dist'))
});

gulp.task('copy-images', function(){
  gulp.src('img/*')
      .pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function(){
  gulp.src('sass/**/*.scss')
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(autoprefixer({
        browsers: ['last 2 versions']
      }))
      .pipe(gulp.dest('./dist/css'))
      .pipe(browserSync.reload({
        stream: true
      }));
});

gulp.task('browserSync', function(){
  browserSync.init({
    port: 8000,
    server: {
      baseDir: "./dist"
    }
  });
});