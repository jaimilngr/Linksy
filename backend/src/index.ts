import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './Routers/user';
import { serviceRouter } from './Routers/provider';
import { commentRouter } from "./Routers/comment";
import { cronJob } from './Routers/cronTrigger';
import { env } from 'hono/adapter';

const app = new Hono();

app.use("/*", cors());
app.route('/api/v1/user', authRouter);
app.route('/api/v1/service', serviceRouter);
app.route("/api/v1/comment", commentRouter);
app.get('/trigger-cron-manually', async (c) => {
    await cronJob(env);
    return c.json({ message: 'Cron job triggered manually' });
  });
  app.get('/', (c) => c.text('Cron Trigger is set up!'));

export default app;
