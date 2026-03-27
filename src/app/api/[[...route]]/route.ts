import { createApp } from '@/lib/api';
import { handle } from 'hono/vercel';
import { authRouter } from './routes/auth';
import { albumsRouter } from './routes/albums';
import { memosRouter } from './routes/memos';
import { photosRouter } from './routes/photos';
import { profileRouter } from './routes/profile';

const app = createApp().basePath('/api');

const route = app
  .use(async (c, next) => {
    console.log('Request from:', c.req.header('User-Agent'));
    console.log('Request headers:', c.req.header);

    await next();
  })
  .get('/', (c) => c.json({ message: 'Welcome to the Album API' }))
  .route('/auth', authRouter)
  .route('/albums', albumsRouter)
  .route('/photos', photosRouter)
  .route('/memos', memosRouter)
  .route('/profile', profileRouter);

export const GET = handle(route);
export const POST = handle(route);
export const PUT = handle(route);
export const DELETE = handle(route);
export const PATCH = handle(route);

export type AppType = typeof route;
