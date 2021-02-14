import marked from 'marked';
import Vinyl from 'Vinyl';
import { PostLayout } from './post-layout';

export class PostFile {
  constructor(private file: Vinyl) {}

  toHtml(): string {
    const markdown = this.file.contents.toString();
    const content = marked(
      markdown.replace(/#.+/, '').replace(/\ntags:.+/m, '')
    );
    const [, tags] = markdown.match(/\ntags:(.+)/);
    const [, title] = markdown.match(/#\s+(.+)/);
    const [, dateStr, name] = [
      ...this.file.stem.match(/(\d{4}-\d{2}-\d{2})-(.+)/),
    ];
    const date = new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const data = {
      content,
      date,
      name,
      title,
      tags: tags.split(',').map((x) => x.trim()),
    };

    return new PostLayout(content, data).rendered();
  }

  metadata(): { link: string; title: string; paragraph: string } {
    const markdown = this.file.contents.toString();
    const [, title] = markdown.match(/#\s+(.+)/);
    const [, year, month, day, name] = this.file.stem.match(
      /(\d{4})-(\d{2})-(\d{2})-(.+)/
    );
    return {
      link: `/${year}/${month}/${day}/${name}.html`,
      title,
      paragraph: 'lorem  sdf',
    };
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toHtml());
  }
}
