import marked from 'marked';
import mustache from 'mustache';
import Vinyl from 'Vinyl';

export class PostFile {
  constructor(private file: Vinyl, private postLayout: any) {}

  toHtml() {
    const markdown = this.file.contents.toString();
    const content = marked(markdown.replace(/#.+/, ''));
    const [, title] = markdown.match(/#\s+(.+)/);
    const [, dateStr, name] = [
      ...this.file.stem.match(/(\d{4}-\d{2}-\d{2})-(.+)/),
    ];
    const date = new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return mustache.render(this.postLayout, {
      content,
      date,
      name,
      title,
    });
  }

  toBuffer() {
    return Buffer.from(this.toHtml());
  }
}
