const { src, dest, watch, series } = require('gulp');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const through = require('through2');
const marked = require('marked');
const del = require('delete');
const fs = require('fs');
const mustache = require('mustache');
var gls = require('gulp-live-server');

const postsGlob = ['src/posts/*.md'];
const pagesGlob = ['src/*.html'];
const assetsGlob = ['src/assets/**/*.*'];

var server = gls.static('dist', 3000);

server.start();

function clean(cb) {
  return del(['dist'], cb);
}

function assets() {
  return src(assetsGlob)
    .pipe(rename({ dirname: 'assets' }))
    .pipe(dest('dist'));
}

function htmlLayouts() {
  const defaultLayout = fs
    .readFileSync('./src/layouts/default.html')
    .toString();
  const postLayout = mustache.render(defaultLayout, {
    content: fs.readFileSync('./src/layouts/post.html').toString(),
  });

  return { defaultLayout, postLayout };
}

function posts() {
  const layouts = htmlLayouts();
  return src(postsGlob)
    .pipe(
      through.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          const output = mustache.render(layouts.postLayout, {
            content: marked(file.contents.toString()),
          });
          file.contents = Buffer.from(output);
        }
        cb(null, file);
      })
    )
    .pipe(rename({ extname: '.html' }))
    .pipe(dest('dist'));
}

function pages() {
  const layouts = htmlLayouts();
  return src(pagesGlob)
    .pipe(
      through.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          const output = mustache.render(layouts.defaultLayout, {
            content: file.contents.toString(),
          });
          file.contents = Buffer.from(output);
        }
        cb(null, file);
      })
    )
    .pipe(dest('dist'));
}

exports.default = function () {
  watch(
    'src/**',
    { ignoreInitial: false, delay: 1000 },
    series(clean, assets, posts, pages)
  );
  watch('src/**', function (file) {
    server.notify.apply(server, [file]);
  });
};
