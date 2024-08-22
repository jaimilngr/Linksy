import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { signupInput, signinInput } from '@jaimil/linksy';
import { getCookie, setCookie } from 'hono/cookie';

// Create a new Hono router
export const authRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_Secret: string;
  }
}>();

authRouter.post("/signup", async (c) => {
  // Set CORS headers
  c.res.headers.set('Access-Control-Allow-Origin','https://linksy.vercel.app');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');

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
    const name = user.name;
    const role = body.role;


    // Set new cookies
    setCookie(c, 'token', token, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    });
    setCookie(c, 'authUser', name, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    });
    setCookie(c, 'role', role, {
      httpOnly: false,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    });

    return c.json({ message: 'User created' });
  } catch (e) {
    console.error("Error creating user:", e);
    c.status(409);
    return c.json({
      error: "User already exists with the same email or contact number"
    });
  }
});

authRouter.post("/signin", async (c) => {
  c.res.headers.set('Access-Control-Allow-Origin', 'https://linksy.vercel.app');
  c.res.headers.set('Access-Control-Allow-Credentials', 'true');

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
  let role;

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

  if (user) {
    role = "user";
  } else {
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

    if (user) {
      role = 'service';
    } else {
      c.status(403);
      return c.json({ error: "User not found" });
    }
  }

  const token = await sign({ id: user.id }, c.env.JWT_Secret);
  const name = user.name;


  setCookie(c, 'token', token, {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  });
  setCookie(c, 'authUser', name, {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  });
  setCookie(c, 'role', role, {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  });

  return c.json({ message: 'User found' });
});

authRouter.post('/additional-data', async (c) => {
  const prisma = new PrismaClient().$extends(withAccelerate());

  try {
    const token = getCookie(c,'token', 'secure')

    if (!token) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const secretKey = c.env.JWT_Secret;
    const decodedToken = await verify(token, secretKey);

    const userId = decodedToken.id as string;
    const role = getCookie(c,'role', 'secure');

    const body = await c.req.json();

    if (role === 'service') {
      await prisma.serviceProvider.update({
        //@ts-ignore
        where: { id: userId },
        data: {
          location: `${body.latitude},${body.longitude}`,
          //@ts-ignore
          Address: body.address,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          location: `${body.latitude},${body.longitude}`,
          Address: body.address,
        },
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error processing additional data:', error);
    return c.json({ error: 'Failed to submit additional data' }, 500);
  }
});

export default authRouter;
