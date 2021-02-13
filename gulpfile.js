const { src, dest, watch, series } = require('gulp');
const rename = require('gulp-rename');
const through = require('through2');
const marked = require('marked');
const del = require('delete');
const fs = require('fs');
const mustache = require('mustache');

const layoutTemplate = fs.readFileSync('./src/layout.html').toString();
const postsGlob = 'src/**/*.md';

function clean(cb) {
  del(['dist'], cb);
}

function build() {
  return src(postsGlob)
    .pipe(
      through.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          const view = {
            content: marked(file.contents.toString()),
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
  watch(postsGlob, { ignoreInitial: false }, series(clean, build));
};
