import ejs from 'ejs';
import fs from 'fs';
import { ContentMeta } from './content-meta';

function render(template: string, data: any): string {
  return ejs.render(template, {
    ...data,
    template(name, customData = {}) {
      return render(fs.readFileSync(`src/templates/${name}.html`).toString(), {
        ...data,
        ...customData,
      });
    },
  });
}

export class EjsTemplate {
  constructor(private content: string, private data: any = {}) {}

  render(): string {
    if (this.data.layout) {
      const layoutFileText = fs
        .readFileSync(`src/templates/${this.data.layout}.html`)
        .toString();

      const layoutContentMeta = new ContentMeta(layoutFileText);
      const layoutMetadata = layoutContentMeta.metadata();
      const layoutContent = layoutContentMeta.content();
      return new EjsTemplate(layoutContent, {
        ...this.data,
        layout: '',
        content: render(this.content, this.data),
        ...layoutMetadata,
      }).render();
    }

    return render(this.content, this.data);
  }
}
