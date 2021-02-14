import marked from 'marked';
import Vinyl from 'Vinyl';
import { ContentMeta } from './content-meta';
import { EjsTemplate } from './ejs-template';

export class MarkdownPostFile {
  private metadata: any;
  private content: string;

  constructor(private file: Vinyl) {
    const contentMeta = new ContentMeta(this.file.contents.toString());
    this.metadata = contentMeta.metadata();
    this.content = marked(contentMeta.content());
  }

  toHtml(): string {
    return new EjsTemplate(this.content, this.data()).render();
  }

  data() {
    const [, year, month, day] = this.metadata.date.match(
      /(\d{4})-(\d{2})-(\d{2})/
    );
    const [, , basename] = this.file.stem.match(/(\d{4}-\d{2}-\d{2})-(.*)/);
    return {
      ...this.metadata,
      firstParagraph: this.content.split('<!--more-->')[0],
      layout: 'post',
      date: new Date(this.metadata.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      link: `/${year}/${month}/${day}/${basename}.html`,
    };
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toHtml());
  }
}
