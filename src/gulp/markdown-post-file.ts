import marked from 'marked';
import readingTime from 'reading-time';
import Vinyl from 'vinyl';
import { ContentMeta } from './content-meta';
import { EjsTemplate } from './ejs-template';

export class MarkdownPostFile {
  private metadata: any;
  private content: string;
  private markdown: string;

  constructor(private file: Vinyl) {
    const contentMeta = new ContentMeta(this.file.contents.toString());
    this.metadata = contentMeta.metadata();
    this.markdown = contentMeta.content();
    this.content = marked(this.markdown);
  }

  toHtml(): string {
    return new EjsTemplate(this.content, this.data()).render();
  }

  data() {
    const [, year, month, day, name] = this.file.path.match(
      /\/(\d{4})\/(\d{2})\/(\d{2})-(.+)\.(post|draft)\.md$/
    );
    const date = new Date(`${year}-${month}-${day}`);

    return {
      ...this.metadata,
      firstParagraph: this.content.split('<!-- more -->')[0],
      layout: 'post',
      date,
      formattedDate: new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      link: `/${year}/${month}/${day}/${name}`,
      readingTime: readingTime(this.markdown).text,
    };
  }

  toBuffer(): Buffer {
    return Buffer.from(this.toHtml());
  }
}
