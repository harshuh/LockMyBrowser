import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({

  // Note for optioinal field (if a variable is decleared in .env but its value is not assigned then its a empty string please comment it out )

    //server
    NODE_ENV : z.enum(['development', 'production', 'test']).default('development'),
    PORT     : z.string().default('1124'),

    // Database
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // Redis Url
    REDIS_URL: z.string().min(1,'REDIS_URL is required'),

    //Redis (I dont use if you want to use then use it )
    //it is required when it is not passed in the above url (REDIS_URL) also pass these variables in redisClient file (below url)
    REDIS_USERNAME: z.string().min(1,'REDIS_USERNAME is required').optional(),
    REDIS_PASSWORD: z.string().min(1,'REDIS_PASSWORD is required').optional(),


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