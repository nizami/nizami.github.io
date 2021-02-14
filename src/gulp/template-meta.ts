import { ContentMeta } from './content-meta';
import { EjsTemplate } from './ejs-template';

export class TemplateMeta {
  constructor(private contentMeta: ContentMeta) {}

  content(): string {
    const metadata = this.contentMeta.metadata();
    metadata.content = this.contentMeta.content()
    const template = new EjsTemplate(metadata.layout, metadata);
    return template.render();
  }
}
