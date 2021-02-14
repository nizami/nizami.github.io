import del from 'delete';
import fs from 'fs';
import glob from 'glob';
import { dest, series, src, watch } from 'gulp';
import gls from 'gulp-live-server';
import rename from 'gulp-rename';
import through from 'through2';
import Vinyl from 'vinyl';
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
      through.obj((file: Vinyl, _, cb) => {
        file.contents = new PostFile(file).toBuffer();

        cb(null, file);
      })
    )
    .pipe(
      rename((path) => {
        const [, year, month, day, name] = path.basename.match(
          /(\d{4})-(\d{2})-(\d{2})-(.+)/
        );
        path.dirname += `/${year}/${month}/${day}`;
        path.basename = name;
        path.extname = '.html';
      })
    )
    .pipe(dest('dist'));
}

function pages() {
  const postMetas = glob
    .sync('src/posts/**/*.md')
    .map(
      (x) =>
        new Vinyl({
          cwd: '.',
          base: '.',
          path: x,
          contents: fs.readFileSync(x),
        })
    )
    .map((x) => new PostFile(x).metadata());

  return src(pagesGlob)
    .pipe(
      through.obj((file: Vinyl, _, cb) => {
        const data = { posts: postMetas };

        const output = new DefaultLayout(
          file.contents.toString(),
          data
        ).rendered();
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
