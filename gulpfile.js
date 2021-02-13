const { src, dest, watch, series } = require('gulp');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const through = require('through2');
const marked = require('marked');
const del = require('delete');
const fs = require('fs');
const mustache = require('mustache');

const layoutTemplate = fs
  .readFileSync('./src/templates/layout.html')
  .toString();
const pagesGlob = ['src/posts/*.md', 'src/*.html'];

function clean(cb) {
  del(['dist'], cb);
}

function build() {
  return src(pagesGlob)
    .pipe(
      gulpif(
        (x) => x.extname === '.md',
        through.obj(function (file, _, cb) {
          if (file.isBuffer()) {
            file.contents = Buffer.from(marked(file.contents.toString()));
          }
          cb(null, file);
        })
      )
    )
    .pipe(
      through.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          const view = {
            content: file.contents.toString(),
          };
          const output = mustache.render(layoutTemplate, view);
          file.contents = Buffer.from(output);
        }
        cb(null, file);
      })
    )
    .pipe(rename({ extname: '.html' }))
    .pipe(dest('dist'));
}

exports.default = function () {
  watch(pagesGlob, { ignoreInitial: false }, series(clean, build));
};
