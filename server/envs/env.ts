import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({

    //server
    NODE_ENV : z.enum(['development', 'production', 'test']).default('development'),
    PORT     : z.string().default('1124'),

    // Database
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // Redis Url
    REDIS_URL: z.string().min(1,'REDIS_URL is required'),

    //Redis (I dont use if you want to use then use it )
    REDIS_USERNAME: z.string().min(1,'REDIS_USERNAME is required'),
    REDIS_PASSWORD: z.string().min(1,'REDIS_PASSWORD is required'),


    // JWT
    JWT_ACCESS_SECRET    : z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
    JWT_REFRESH_SECRET   : z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
    JWT_ACCESS_EXPIRES_IN : z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Seed
    ADMIN_EMAIL   : z.email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),

})  

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1); // stop the server — don't start with bad config
}

export const env = parsed.data;