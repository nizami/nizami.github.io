import del from 'delete';
import fs from 'fs';
import glob from 'glob';
import { dest, series, src, watch } from 'gulp';
import gls from 'gulp-live-server';
import rename from 'gulp-rename';
import through from 'through2';
import Vinyl from 'vinyl';
import { ContentMeta } from './content-meta';
import { EjsTemplate } from './ejs-template';
import { MarkdownPostFile } from './markdown-post-file';

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
        file.contents = new MarkdownPostFile(file).toBuffer();
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
  const posts = glob
    .sync('src/posts/**/*.md')
    .sort()
    .map(
      (x) =>
        new Vinyl({
          cwd: '.',
          base: '.',
          path: x,
          contents: fs.readFileSync(x),
        })
    )
    .map((x) => new MarkdownPostFile(x))
    .map((x) => x.data());

  return src(pagesGlob)
    .pipe(
      through.obj((file: Vinyl, _, cb) => {
        const contentMeta = new ContentMeta(file.contents.toString());
        const metadata = contentMeta.metadata();
        const content = contentMeta.content();
        const output = new EjsTemplate(content, {
          posts,
          ...metadata,
        }).render();
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
