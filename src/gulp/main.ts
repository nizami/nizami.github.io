import del from 'delete';
import { dest, series, src, watch } from 'gulp';
import gls from 'gulp-live-server';
import rename from 'gulp-rename';
import through from 'through2';
import { DefaultLayout } from './default-layout';
import { PostFile } from './post-file';

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

function posts() {
  return src(postsGlob)
    .pipe(
      through.obj(function (file, _, cb) {
        file.contents = new PostFile(file).toBuffer();
        cb(null, file);
      })
    )
    .pipe(rename({ extname: '.html' }))
    .pipe(dest('dist'));
}

function pages() {
  return src(pagesGlob)
    .pipe(
      through.obj(function (file, _, cb) {
        const output = new DefaultLayout(file.contents.toString()).rendered();
        file.contents = Buffer.from(output);
        cb(null, file);
      })
    )
    .pipe(dest('dist'));
}

export default function () {
  watch(
    'src/**',
    { ignoreInitial: false, delay: 200 },
    series(clean, assets, posts, pages)
  );
  watch('src/**', function (file) {
    server.notify.apply(server, [file]);
  });
}
