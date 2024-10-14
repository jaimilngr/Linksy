import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cronJob } from './Routers/cronTrigger';
import { authRouter } from './Routers/user';
import { serviceRouter } from './Routers/provider';
import { commentRouter } from './Routers/comment';

const app = new Hono();

app.use("/*", cors());

// API Routes
app.route('/api/v1/user', authRouter);
app.route('/api/v1/service', serviceRouter);
app.route("/api/v1/comment", commentRouter);
app.get('/', (c) => c.text('Worker is running!'));

// Handle Scheduled Events
app.get('/__scheduled', async (c) => {
  console.log('Scheduled event triggered');
  await cronJob(c.env);  
  return c.text('Cron job executed!');
});

// Default export for the Cloudflare Worker
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },

  // Scheduled Event Handler
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    console.log('Scheduled event triggered');
    ctx.waitUntil(cronJob(env));
  },
};
