import app from './index'; 
import { cronJob } from './Routers/cronTrigger';

// Handle HTTP requests with the Hono app
export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },

  // Handle scheduled events for cron jobs
  async scheduled(event: ScheduledEvent, env: any, ctx: ExecutionContext) {
    ctx.waitUntil(cronJob(env)); 
  },
};
