import marked from 'marked';
import Vinyl from 'Vinyl';
import { PostLayout } from './post-layout';

export class PostFile {
  constructor(private file: Vinyl) {}

  toHtml(): string {
    const markdown = this.file.contents.toString();
    const content = marked(
      markdown.replace(/#.+\n/, '').replace(/^tags:.+\n/m, '')
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

  metadata(): { link: string; date: string; title: string; paragraph: string } {
    const markdown = this.file.contents.toString();

    const [, title] = markdown.match(/#\s+(.+)/);
    const [, year, month, day, name] = this.file.stem.match(
      /(\d{4})-(\d{2})-(\d{2})-(.+)/
    );

    const paragraph = marked(
      markdown
        .replace(/#.+\n/, '')
        .replace(/^tags:.+\n/m, '')
        .trim()
        .split('\n')[0]
    );
    const [, dateStr] = [...this.file.stem.match(/(\d{4}-\d{2}-\d{2})-(.+)/)];
    const date = new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return {
      link: `/${year}/${month}/${day}/${name}.html`,
      title,
      date,
      paragraph: paragraph,
    };
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toHtml());
  }
}
