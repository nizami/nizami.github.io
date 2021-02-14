import YAML from 'yaml';

export class ContentMeta {
  private metaText: string;
  private contentText: string;

  constructor(fileContent: string) {
    [, this.metaText, this.contentText] = fileContent.match(
      /---([\s\S]+)---([\s\S]+)/
    ) || [, , fileContent];
  }

  metadata(): any {
    return this.metaText ? YAML.parse(this.metaText.trim()) : {};
  }

  content() {
    return this.contentText;
  }
}
