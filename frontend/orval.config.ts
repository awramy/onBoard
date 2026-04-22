import { defineConfig } from 'orval';

/**
 * Генерация напрямую из Swagger бэкенда (нужен запущенный Nest на :3000).
 *
 * В orval v8 спека валидируется до input.override.transformer — «починить» JSON
 * трансформером нельзя. Невалидные поля (например `examples` вместо `example`
 * в OAS 3.0) нужно устранять в NestJS @ApiProperty / пересборке бэка.
 */
export default defineConfig({
  reactQuery: {
    input: {
      target: 'http://localhost:3000/api/docs-json',
    },
    output: {
      mode: 'single',
      target: 'src/api/generated/react-query.ts',
      schemas: 'src/api/generated/schemas',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      /** v8: не «prettier: true» — встроенный formatter peer-зависимости prettier */
      formatter: 'prettier',
      override: {
        mutator: {
          path: 'src/api/custom-fetcher.ts',
          name: 'customReactQueryAxios',
        },
        query: {
          useQuery: true,
          useMutation: true,
          useInfinite: false,
          signal: true,
        },
      },
    },
  },
});
