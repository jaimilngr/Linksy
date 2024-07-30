import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRouter } from './Routers/user'
import { serviceRouter } from './Routers/provider'

const app = new Hono()
app.use("/*" ,cors())

app.route("/api/v1/user", authRouter)
app.route("/api/v1/provider", serviceRouter)


export default app
