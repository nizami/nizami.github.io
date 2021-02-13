import { DefaultLayout } from './default-layout';
import { Layout } from './layout';

export class PostLayout extends Layout {
  constructor(content: string, data: any) {
    super('post', content, data);
  }

  rendered(): string {
    return new DefaultLayout(super.rendered(), this.data).rendered();
  }
}
