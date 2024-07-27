import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { userRouter } from './Routers/user'
import { providerRouter } from './Routers/provider'

const app = new Hono()
app.use("/*" ,cors())

app.route("/api/v1/user", userRouter)
app.route("/api/v1/provider", providerRouter)

export default app
