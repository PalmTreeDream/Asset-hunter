import { z } from 'zod';
import { insertLeadSchema, leads, insights } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  leads: {
    list: {
      method: 'GET' as const,
      path: '/api/leads',
      responses: {
        200: z.array(z.custom<typeof leads.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/leads/:id',
      responses: {
        200: z.custom<typeof leads.$inferSelect & { insights?: typeof insights.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leads',
      input: insertLeadSchema,
      responses: {
        201: z.custom<typeof leads.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/leads/:id',
      input: insertLeadSchema.partial(),
      responses: {
        200: z.custom<typeof leads.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/leads/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    search: {
      method: 'POST' as const,
      path: '/api/leads/search',
      input: z.object({
        query: z.string().min(1),
        limit: z.number().optional().default(5),
      }),
      responses: {
        200: z.array(z.object({
          company: z.string(),
          website: z.string().optional(),
          description: z.string().optional(),
          source: z.string(),
        })),
      },
    },
    analyze: {
      method: 'POST' as const,
      path: '/api/leads/:id/analyze',
      responses: {
        200: z.custom<typeof insights.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
