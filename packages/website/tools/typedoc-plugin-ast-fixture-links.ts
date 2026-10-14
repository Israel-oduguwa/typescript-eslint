import type { Application } from 'typedoc';

import { existsSync } from 'node:fs';
import * as path from 'node:path';
import { Comment, CommentTag, Converter, ReflectionKind } from 'typedoc';

export function astFixtureLinks(app: Application): void {
  app.converter.on(Converter.EVENT_RESOLVE_END, context => {
    for (const reflection of context.project.getChildrenByKind(
      ReflectionKind.Interface | ReflectionKind.TypeAlias,
    )) {
      const source = reflection.sources?.find(
        source => path.basename(source.fullFileName) === 'spec.ts',
      );
      if (!source?.url) {
        continue;
      }

      if (
        !existsSync(path.join(path.dirname(source.fullFileName), 'fixtures'))
      ) {
        continue;
      }

      const fixturesUrl = source.url
        .replace('/blob/', '/tree/')
        .replace(/\/spec\.ts#L\d+$/, '/fixtures');
      reflection.comment ??= new Comment();
      reflection.comment.blockTags.push(
        new CommentTag('@see', [
          {
            kind: 'text',
            text: `[${reflection.name} examples](${fixturesUrl})`,
          },
        ]),
      );
    }
  });
}
