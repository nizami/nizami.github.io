import del from 'delete';
import fs from 'fs';
import glob from 'glob';
import { dest, series, src, watch } from 'gulp';
import gulpIgnore from 'gulp-ignore';
import gls from 'gulp-live-server';
import rename from 'gulp-rename';
import gulpSitemap from 'gulp-sitemap';
import through from 'through2';
import Vinyl from 'vinyl';
import { ContentMeta } from './content-meta';
import { EjsTemplate } from './ejs-template';
import { MarkdownPostFile } from './markdown-post-file';

const postsGlob = `src/posts/**/*.@(post${
  process.argv.includes('--prod') ? '' : '|draft'
}).md`;

function clean(cb) {
  return del(['dist'], cb);
}

function sitemap() {
  return src('dist/**/*.html', { read: false })
    .pipe(gulpIgnore.exclude((file: Vinyl) => file.dirname.endsWith('404')))
    .pipe(gulpSitemap({ siteUrl: 'https://nizami.dev' }))
    .pipe(dest('dist'));
}
function assets() {
  return src('src/assets/**/*.*')
    .pipe(rename({ dirname: 'assets' }))
    .pipe(dest('dist'));
}

function rootFiles() {
  return src('src/root-files/**/*')
    .pipe(rename({ dirname: '.' }))
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
      rename((path, file) => {
        const [, , , day, name] = file.path.match(
          /\/(\d{4})\/(\d{2})\/(\d{2})-(.+)\.(post|draft)\.md$/
        );
        path.dirname += `/${day}/${name}`;
        path.basename = 'index';
        path.extname = '.html';
      })
    )
    .pipe(dest('dist'));
}

function pages() {
  const posts = glob
    .sync(postsGlob)
    .sort()
    .reverse()
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

  return src('src/*.html')
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
    .pipe(
      rename((path) => {
        if (['index', '404'].includes(path.basename)) return;
        path.dirname += `/${path.basename}`;
        path.basename = 'index';
        path.extname = '.html';
      })
    )
    .pipe(dest('dist'));
}

export default function watchTask() {
  var server = gls.static('dist', 3000);
  server.start();
  watch('src/**', { ignoreInitial: false, delay: 200 }, build);
}

export const build = series(clean, rootFiles, assets, posts, pages, sitemap);
