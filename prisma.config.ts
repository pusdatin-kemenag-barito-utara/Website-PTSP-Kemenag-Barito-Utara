import { defineConfig, env } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  datasource: {
    url: env('DATABASE_URL'),
  },
});
