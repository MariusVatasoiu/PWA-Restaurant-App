var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();

gulp.task('default',['copy-html', 'copy-images', 'styles'], function(){
  console.log('hello world');
});

gulp.task('watch', ['browserSync', 'styles'], function(){
  gulp.watch('sass/**/*.scss', ['styles']);
  gulp.watch('/index.html', ['copy-html']);
  gulp.watch('*.html', browserSync.reload);
  gulp.watch('js/**/*.js', browserSync.reload);
});

gulp.task('copy-html', function(){
  gulp.src('./index.html')
      .pipe(gulp.dest('./dist'))
});

gulp.task('copy-images', function(){
  gulp.src('img/*')
      .pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function(){
  gulp.src('sass/**/*.scss')
      .pipe(sass().on('error', sass.logError))
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