// import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

const db = drizzle({}, { schema });

export default db;
