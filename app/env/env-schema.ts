import { z } from 'zod';

export const envSchema = z.object({
  GENIUS_ACCESS_TOKEN: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_KEY: z.string(),
  SESSION_SECRET: z.string(),
  NODE_ENV: z.enum(['test', 'development', 'production']),
  ENABLE_TEST_ROUTES: z.enum(['true', 'false']),
});
