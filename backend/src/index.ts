import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './Routers/user';
import { serviceRouter } from './Routers/provider';
import { commentRouter } from "./Routers/comment";

const app = new Hono();

app.use("/*" ,cors())
app.route('/api/v1/user', authRouter);
app.route('/api/v1/service', serviceRouter);
app.route("/api/v1/comment" , commentRouter)


export default app;
