import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { jwt, sign, verify } from "hono/jwt";
import { signupInput, signinInput } from '@jaimil/linksy';

export const authRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_Secret: string;
  }
}>();

const jwtAuthMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Authorization token missing' }, 401);
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = c.env.JWT_Secret;

  try {
    const decoded = await verify(token, jwtSecret);
    (c.req as any).user = decoded; 
    return next();
  } catch (e) {
    console.error("JWT verification failed:", e);
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};

// Sign-up route
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

    return c.json({
      jwt: token,
      name: user.name,
      id: user.id,
      role: body.role
    });

  } catch (e) {
    console.error("Error creating user:", e); 
    c.status(409);
    return c.json({
      error: "User already exists with the same email or contact number"
    });
  }
});

// Sign-in route
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
  let role: "user" | "service" | null = null;

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
      role = "service";
    }
  }
  if (!user) {
    c.status(403);
    return c.json({
      error: "User not found"
    });
  }

  const token = await sign({ id: user.id }, c.env.JWT_Secret);

  return c.json({
    jwt: token,
    name: user.name,
    id: user.id,
    role: role
  });
});

authRouter.use(jwtAuthMiddleware);

authRouter.post('/additional-data', async (c) => {
  const body = await c.req.json();

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const { address } = body;

    const userId = (c.req as any).user.id as string;

    if (!userId) {
      return c.json({ error: 'Invalid user ID from token' }, 400);
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { Address:address },
    });

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error processing additional data:', error);
    return c.json({ error: 'Failed to submit additional data', details: error.message }, 500);
  }
});

authRouter.get('/profile', async (c) => {
  const user = (c.req as any).user;
  const role = c.req.header('Role'); 

  if (!user || !role) {
    return c.json({ error: 'Unauthorized or role missing' }, 401);
  }

  const userId = user.id as string;

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    let profile;

    if (role === 'service') {
      profile = await prisma.serviceProvider.findUnique({
        //@ts-ignore
        where: { id: userId },
        select: { id: true, name: true, email: true, contactNo: true }
      });
    } else if (role === 'user') {
      profile = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, contactNo: true, Address: true }
      });
    } else {
      return c.json({ error: 'Invalid role' }, 400);
    }

    if (!profile) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(profile);
  } catch (error: any) {
    console.error('Error fetching profile data:', error);
    return c.json({ error: 'Failed to fetch profile data', details: error.message }, 500);
  }
});

// Profile route (put)
authRouter.put('/profile', async (c) => {
  const user = (c.req as any).user;
  const role = c.req.header('Role'); 
  const body = await c.req.json();

  if (!user || !role) {
    return c.json({ error: 'Unauthorized or role missing' }, 401);
  }

  const userId = user.id as string;

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    if (!body.name || !body.email) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (role === 'service') {
      const updatedServiceProvider = await prisma.serviceProvider.update({
                //@ts-ignore

        where: { id: userId },
        data: { ...body },
        select: { id: true, name: true, email: true, contactNo: true}
      });

      return c.json(updatedServiceProvider);
    } else if (role === 'user') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { ...body },
        select: { id: true, name: true, email: true, contactNo: true, Address: true }
      });

      return c.json(updatedUser);
    } else {
      return c.json({ error: 'Invalid role' }, 400);
    }
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile', details: error.message }, 500);
  }
});

export default authRouter;
