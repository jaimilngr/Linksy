import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './Routers/user'
import { serviceRouter } from './Routers/provider'

const app = new Hono()

const allowedOrigins = ['http://localhost:5173', 'https://linksy.vercel.app'];

app.use("*", cors({
    origin: allowedOrigins,
    credentials: true, 
  }));
app.route("/api/v1/user", authRouter)
app.route("/api/v1/provider", serviceRouter)


export default app