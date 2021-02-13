import fs from 'fs';
import mustache from 'mustache';

export abstract class Layout {
  constructor(
    protected name: string,
    protected content: string,
    protected data: any = {}
  ) {}

  rendered(): string {
    const template = fs
      .readFileSync(`src/layouts/${this.name}.html`)
      .toString();

    return mustache.render(template, {
      ...this.data,
      content: this.content,
    });
  }
}
