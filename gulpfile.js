const { src, dest, series } = require('gulp');
const rename = require('gulp-rename');
const through = require('through2');
const marked = require('marked');
const del = require('delete');

function clean(cb) {
  del(['dist'], cb);
}

function build() {
  return src('src/*.md')
    .pipe(
      through.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          const html = marked(file.contents.toString());
          file.contents = Buffer.from(html);
        }
        cb(null, file);
      })
    )
    .pipe(rename({ extname: '.html' }))
    .pipe(dest('dist'));
}

exports.default = series(clean, build);
