import { defineConfig, type OpenApiDocument } from 'orval';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeOpenApiSpec = (spec: OpenApiDocument) => {
  const normalizedSpec = structuredClone(spec);
  const document: unknown = normalizedSpec;

  if (!isRecord(document) || !isRecord(document.paths)) {
    return normalizedSpec;
  }

  for (const pathItem of Object.values(document.paths)) {
    if (!isRecord(pathItem)) {
      continue;
    }

    for (const operation of Object.values(pathItem)) {
      if (!isRecord(operation) || !isRecord(operation.responses)) {
        continue;
      }

      for (const response of Object.values(operation.responses)) {
        if (!isRecord(response)) {
          continue;
        }

        if (isRecord(response.content) && '*/*' in response.content) {
          response.content['application/json'] = response.content['*/*'];
          delete response.content['*/*'];
        }

        if (isRecord(response.headers)) {
          for (const header of Object.values(response.headers)) {
            if (isRecord(header)) {
              delete header.style;
              if (!('schema' in header) && !('content' in header)) {
                // Springdoc emits Location headers without the schema required by OpenAPI 3.1.
                header.schema = { type: 'string' };
              }
            }
          }
        }
      }
    }
  }

  return normalizedSpec;
};

export default defineConfig({
  parts: {
    input: {
      target: './schema.json',
      filters: {
        tags: ['구분/파트'],
      },
      override: {
        transformer: normalizeOpenApiSpec,
      },
    },
    output: {
      ...getOutput('parts'),
    },
  },
  semesters: {
    input: {
      target: './schema.json',
      filters: {
        tags: ['학과/학기/단과대'],
      },
      override: {
        transformer: normalizeOpenApiSpec,
      },
    },
    output: {
      ...getOutput('semesters'),
    },
  },
  schedule: {
    input: {
      target: './schema.json',
      filters: {
        tags: ['면접 일정'],
      },
      override: {
        transformer: normalizeOpenApiSpec,
      },
    },
    output: {
      ...getOutput('schedule'),
    },
  },
});

function getOutput(domain: string) {
  const operationNames = {
    'get /parts': 'getParts',
    'get /semesters': 'getSemesters',
    'get /semesters/now': 'getSemestersNow',
  };

  return {
    client: 'fetch' as const,
    clean: true,
    formatter: 'prettier' as const,
    mode: 'split' as const,
    schemas: {
      mode: 'single' as const,
      path: `./src/apis/generated/${domain}/schemas.ts`,
      type: 'zod' as const,
    },
    target: `./src/apis/generated/${domain}/client.ts`,
    override: {
      includeZodSchemaInArguments: true,
      operationName: (operation, route, verb) =>
        operationNames[`${verb} ${route}` as keyof typeof operationNames] ?? operation.operationId,
      fetch: {
        forceSuccessResponse: true,
        runtimeValidation: true,
      },
      mutator: {
        name: 'orvalApi',
        path: './src/apis/orval.ts',
      },
      zod: {
        generateCompanionTypes: true,
        generateReusableSchemas: true,
        version: 4 as const,
      },
    },
  };
}
