import { envSchema } from './env-schema';

const env = envSchema.parse(process.env);

export { env };
