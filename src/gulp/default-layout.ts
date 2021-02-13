import { Layout } from './layout';

export class DefaultLayout extends Layout {
  constructor(content: string, data: any = {}) {
    super('default', content, data);
  }
}
