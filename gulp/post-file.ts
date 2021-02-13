import mustache from 'mustache';
import Vinyl from 'Vinyl';

export class PostFile {
  file;
  layouts;
  constructor(file: Vinyl, layouts) {
    this.file = file;
    this.layouts = layouts;
  }

  toHtml() {
    return mustache.render(this.layouts.defaultLayout, {
      content: this.file.contents.toString(),
      // date
    });
  }

  toBuffer() {
    return Buffer.from(this.toHtml());
  }
}
