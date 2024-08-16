import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { signupInput, signinInput } from '@jaimil/linksy';
import cookie from 'cookie';

export const authRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_Secret: string;
  }
}>();



export const authMiddleware = async (c: any, next: () => Promise<void>) => {
  const cookies = c.req.headers.get("Cookie") || "";
  const token = cookies.split("; ").find((row: string) => row.startsWith('authToken='));

  if (token) {
    const tokenValue = token.split('=')[1];
    try {
      const payload = verify(tokenValue, c.env.JWT_Secret);
      c.user = payload; 
      await next(); 
    } catch (e) {
      c.status(401);
      return c.json({ error: "Invalid token" });
    }
  } else {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }
};

authRouter.post("/signup", async (c) => {
  const body = await c.req.json();

  console.log("Received request body:", body);
  
  const result = signupInput.safeParse(body);
  if (!result.success) {
    c.status(400);
    return c.json({ errors: result.error.errors });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    let user;
    if (body.role === 'service') {
      user = await prisma.serviceProvider.create({
        data: {
          name: body.name,
          email: body.email,
          password: body.password,
          contactNo: body.contactNo,
          mode: body.mode ?? "offline",
        },
        select: {
          id: true,
          name: true
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: body.name,
          contactNo: body.contactNo,
          email: body.email,
          password: body.password,
        },
        select: {
          id: true,
          name: true
        }
      });
    }

    const token = await sign({ id: user.id }, c.env.JWT_Secret);

    c.header("Set-Cookie", cookie.serialize('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      path: '/',
      maxAge: 3600 // 1 hour
    }));


    return c.json({
      jwt: token,
      name: user.name,
      id: user.id
    });

  } catch (e) {
    console.error("Error creating user:", e); 
    c.status(409);
    return c.json({
      error: "User already exists with the same email or contact number"
    });
  }
});

authRouter.post("/signin", async (c) => {
  const body = await c.req.json();

  const result = signinInput.safeParse(body);
  if (!result.success) {
    c.status(400);
    return c.json({ errors: result.error.errors });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  let user;
  user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password
    },
    select: {
      id: true,
      name: true
    }
  });

  if (!user) {
    user = await prisma.serviceProvider.findUnique({
      where: {
        email: body.email,
        password: body.password
      },
      select: {
        id: true,
        name: true
      }
    });
  }

  if (!user) {
    c.status(403);
    return c.json({
      error: "User not found"
    });
  }

  const token = await sign({ id: user.id }, c.env.JWT_Secret);

  c.header("Set-Cookie", cookie.serialize('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'strict',
    path: '/',
    maxAge: 3600 
  }));

  return c.json({
    jwt: token,
    name: user.name,
    id: user.id
  });
});
