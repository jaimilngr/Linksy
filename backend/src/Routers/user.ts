import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { signupInput, signinInput } from '@jaimil/linksy';
import { v4 as uuidv4 } from 'uuid';

export const authRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_Secret: string;
    MAILJET_API_KEY: string;
    MAILJET_API_SECRET: string;
    FRONTEND_URL: string;
  }
}>();

interface Environment {
  MAILJET_API_KEY: string;
  MAILJET_API_SECRET: string;
}

interface MailjetResponse {
  Messages: {
    Status: string;
    [key: string]: any; 
  }[];
}

// Middleware for JWT authentication

export const jwtAuthMiddleware = async (c: any, next: any) => {
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



const generateRandomToken = async (length: number): Promise<string> => {
  const uuid = uuidv4().replace(/-/g, '');
  return uuid.slice(0, length);
};


const sendVerificationEmail = async (c:any,email: string, name: string, verificationLink: string) => {
  const apiKey = c.env.MAILJET_API_KEY;
  const apiSecret = c.env.MAILJET_API_SECRET;

  try {
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: 'linksy.info@gmail.com',
              Name: 'Linksy'
            },
            To: [
              {
                Email: email,
                Name: name
              }
            ],
            TemplateID: 6259358, 
            TemplateLanguage: true,
            Variables: {
              verificationLink: verificationLink
            }
          }
        ]
      })
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


// Sign-up route
authRouter.post("/signup", async (c) => {
  const body = await c.req.json();
  const result = signupInput.safeParse(body);

  if (!result.success) {
    c.status(400);
    return c.json({ errors: result.error.errors });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          { contactNo: body.contactNo }
        ]
      }
    });

    if (existingUser) {
      const errorResponse = {
        error: "User already exists",
        fields: {
          email: existingUser.email === body.email ? "Email already in use" : "",
          contactNo: existingUser.contactNo === body.contactNo ? "Contact number already in use" : ""
        }
      };
      c.status(409);
      return c.json(errorResponse);
    }

    const existingServiceProvider = await prisma.serviceProvider.findFirst({
      where: {
        OR: [
          { email: body.email },
          { contactNo: body.contactNo }
        ]
      }
    });

    if (existingServiceProvider) {
      const errorResponse = {
        error: "Service provider already exists",
        fields: {
          email: existingServiceProvider.email === body.email ? "Email already in use" : "",
          contactNo: existingServiceProvider.contactNo === body.contactNo ? "Contact number already in use" : ""
        }
      };
      c.status(409);
      return c.json(errorResponse);
    }

    const verificationToken = await generateRandomToken(32);
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 1);

    if (body.role === 'service') {
      await prisma.serviceProvider.create({
        data: {
          name: body.name,
          email: body.email,
          password: body.password,
          contactNo: body.contactNo,
          mode: body.mode ?? "offline",
          verificationToken,
          tokenExpiresAt,
          verified: false, // initially not verified
        }
      });
    } else {
      await prisma.user.create({
        data: {
          name: body.name,
          contactNo: body.contactNo,
          email: body.email,
          password: body.password,
          verificationToken,
          tokenExpiresAt,
          verified: false, // initially not verified
        }
      });
    }

    await sendVerificationEmail(
      c,
      body.email,
      body.name,
      `${c.env.FRONTEND_URL}/verify-email?token=${verificationToken}`
    );

    return c.json({
      message: 'Signup successful, please check your email for a verification link.',
    });

  } catch (e) {
    console.error("Error during signup:", e);
    c.status(500);
    return c.json({
      error: "Internal server error"
    });
  }
});

// Email verification route
authRouter.post('/verify-email', async (c) => {
  const { token } = await c.req.json();

  if (!token) {
    return c.json({ error: 'Verification token is required' }, 400);
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    const serviceProvider = await prisma.serviceProvider.findFirst({ where: { verificationToken: token } });

    if (!user && !serviceProvider) {
      return c.json({ error: 'Invalid or expired token' }, 400);
    }

    let verifiedUser;
    let role = '';

    if (user) {
      if (user.tokenExpiresAt && user.tokenExpiresAt < new Date()) {
        return c.json({ error: 'Token has expired' }, 400);
      }

      verifiedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          verified: true,
          verificationToken: null,
          tokenExpiresAt: null,
        },
        select: {
          id: true,
          name: true,
        },
      });

      role = 'user';
    } else if (serviceProvider) {
      if (serviceProvider.tokenExpiresAt && serviceProvider.tokenExpiresAt < new Date()) {
        return c.json({ error: 'Token has expired' }, 400);
      }

      verifiedUser = await prisma.serviceProvider.update({
        where: { id: serviceProvider.id },
        data: {
          verified: true,
          verificationToken: null,
          tokenExpiresAt: null,
        },
        select: {
          id: true,
          name: true,
        },
      });

      role = 'service';
    }

    if (!verifiedUser) {
      return c.json({ error: 'Unexpected error occurred during verification' }, 500);
    }

    const jwttoken = await sign({ id: verifiedUser.id }, c.env.JWT_Secret);

    return c.json({
      message: 'Email successfully verified. You can now sign in.',
      jwt: jwttoken,
      name: verifiedUser.name,
      role: role
    });
  } catch (e) {
    console.error('Error during email verification:', e);
    return c.json({ error: 'Internal server error' }, 500);
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

  try {
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
        error: "Invalid email or password"
      });
    }

    const token = await sign({ id: user.id }, c.env.JWT_Secret);

    return c.json({
      jwt: token,
      name: user.name,
      id: user.id,
      role: role
    });
    
  } catch (e) {
    console.error("Error signing in:", e);
    c.status(500);
    return c.json({
      error: "Internal server error"
    });
  }
});

authRouter.post('/additional-data', jwtAuthMiddleware, async (c) => {
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

    try {
      await prisma.serviceProvider.update({
        where: { id: userId },
        data: { address: address },
      });
    } catch (error) {
      
      await prisma.user.update({
        where: { id: userId },
        data: { address: address },
      });
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error processing additional data:', error);
    return c.json({ error: 'Failed to submit additional data', details: error.message }, 500);
  }
});


authRouter.get('/profile', jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const userId = user.id as string;

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, contactNo: true, address: true },
    });

    const serviceProfile = await prisma.serviceProvider.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, contactNo: true , address:true },
    });

    if (userProfile) {
      return c.json(userProfile);
    }

    if (serviceProfile) {
      return c.json(serviceProfile);
    }

    return c.json({ error: 'User not found' }, 404);
  } catch (error: any) {
    console.error('Error fetching profile data:', error);
    return c.json({ error: 'Failed to fetch profile data', details: error.message }, 500);
  }
});


// Profile route (put)
authRouter.put('/profile',jwtAuthMiddleware, async (c) => {
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
        where: { id: userId },
        data: { ...body },
        select: { id: true, name: true, email: true, contactNo: true, address:true }
      });

      return c.json(updatedServiceProvider);
    } else if (role === 'user') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { ...body },
        select: { id: true, name: true, email: true, contactNo: true, address: true }
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

// Update password route
authRouter.put('/update-password',jwtAuthMiddleware, async (c) => {
  const body = await c.req.json();

  const { currentPassword, newPassword } = body;
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
    if (!currentPassword || !newPassword) {
      return c.json({ error: 'Missing current or new password' }, 400);
    }

    let validUser;
    if (role === 'service') {
      validUser = await prisma.serviceProvider.findUnique({
        where: { id: userId, password: currentPassword },
      });
      if (validUser) {
        await prisma.serviceProvider.update({
          where: { id: userId },
          data: { password: newPassword },
        });
      }
    } else if (role === 'user') {
      validUser = await prisma.user.findUnique({
        where: { id: userId, password: currentPassword },
      });
      if (validUser) {
        await prisma.user.update({
          where: { id: userId },
          data: { password: newPassword },
        });
      }
    } else {
      return c.json({ error: 'Invalid role' }, 400);
    }

    if (!validUser) {
      return c.json({ error: 'Current password is incorrect' }, 403);
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error updating password:', error);
    return c.json({ error: 'Failed to update password', details: error.message }, 500);
  }
});


authRouter.post('/send-email', async (c) => {
  const body = await c.req.json();

  // Check for required fields
  if (!body.name || !body.email || !body.subject || !body.message) {
    return c.json({ error: 'Name, email, subject, and message are required' }, 400);
  }

  const apiKey = c.env.MAILJET_API_KEY;
  const apiSecret = c.env.MAILJET_API_SECRET;

  try {
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: 'linksy.info@gmail.com', // Verified sender email
              Name: body.name || 'Anonymous', // Use name from the request body
            },
            To: [
              {
                Email: 'linksy.info@gmail.com', // Send to the same email address
                Name: 'Linksy Support',
              }
            ],
            Subject: body.subject,
            TextPart: body.message,
            HTMLPart: `<h3>${body.message}</h3><p>From: ${body.email}</p>`, // Include sender's email in the message
          }
        ]
      })
    });

    const result:MailjetResponse = await response.json();
    console.log(result); // Log the result for debugging

    const messageStatus = result.Messages && result.Messages[0] ? result.Messages[0].Status : "unknown";

    // Log the status for further clarity
    console.log("Message Status:", messageStatus);

    if (messageStatus === "success") {
      return c.json({ message: 'Email sent successfully!' });
    } else {
      return c.json({ error: 'Failed to send email', details: result }, 500);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});



export default authRouter;
