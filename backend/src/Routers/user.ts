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
    DATA_CACHE: KVNamespace;
  }
}>();


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

// Cache handler 
export const cacheHandler = {
  async get(c: any, type: string, key: string) {
    return c.env.DATA_CACHE.get(`${type}-${key}`, 'json');
  },
  
  async set(c: any, type: string, key: string, data: any, ttl = 300) {
    return c.env.DATA_CACHE.put(`${type}-${key}`, JSON.stringify(data), { expirationTtl: ttl });
  },

  async delete(c: any, type: string, key: string) {
    return c.env.DATA_CACHE.delete(`${type}-${key}`);
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

// password reset mail 
const sendPasswordResetEmail = async (c: any, email: string, resetLink: string) => {
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
              }
            ],
            TemplateID: 6364338,
            TemplateLanguage: true,
            Variables: {
              resetLink: resetLink
            }
          }
        ]
      })
    });

    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error sending reset email:', error);
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
          verified: false, 
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
      message: 'Signup successful! Please check your inbox or spam folder for the verification link.',
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
        name: true,
        verificationToken: true,  
        tokenExpiresAt: true      
      }
    });

    if (user) {
      role = "user";
      if (user.verificationToken || (user.tokenExpiresAt && user.tokenExpiresAt < new Date())) {
        const verificationLink = `${c.env.FRONTEND_URL}/verify-email?token=${user.verificationToken}`;
        await sendVerificationEmail(c, body.email, user.name, verificationLink); 

        c.status(403);
        return c.json({
          error: "Your email is not verified. A new verification email has been sent. Please check your email."
        });
      }
    } else {
      user = await prisma.serviceProvider.findUnique({
        where: {
          email: body.email,
          password: body.password
        },
        select: {
          id: true,
          name: true,
          verificationToken: true,  
          tokenExpiresAt: true      
        }
      });

      if (user) {
        role = "service";
        if (user.verificationToken || (user.tokenExpiresAt && user.tokenExpiresAt < new Date())) {
          const verificationLink = `${c.env.FRONTEND_URL}/verify-email?token=${user.verificationToken}`;
          await sendVerificationEmail(c, body.email, user.name,verificationLink); 

          c.status(403);
          return c.json({
            error: "Your email is not verified. A new verification email has been sent. Please check your email."
          });
        }
      }
    }

    // If user not found in either table
    if (!user) {
      c.status(403);
      return c.json({
        error: "Invalid email or password"
      });
    }

    const token = await sign({ id: user.id }, c.env.JWT_Secret);

    // Cache the user data with the token
    const userData = {
      jwt: token,
      name: user.name,
      id: user.id,
      role: role
    };
    
    // Cache user data with token as the key
    await cacheHandler.set(c, 'user', user.id, userData, 3600); // Cache for 1 hour

    return c.json(userData);
    
  } catch (e) {
    console.error("Error signing in:", e);
    c.status(500);
    return c.json({
      error: "Internal server error"
    });
  }
});

// password reset request
authRouter.post('/request-password-reset', async (c) => {
  const { email } = await c.req.json();
  
  if (!email) {
    return c.json({ error: 'Email is required' }, 400);
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    const serviceProvider = await prisma.serviceProvider.findUnique({ where: { email } });

    if (!user && !serviceProvider) {
      return c.json({ error: 'No user found with this email' }, 404);
    }

    const resetPasswordToken = await generateRandomToken(32);
    const resetTokenExpiresAt = new Date();
    resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1);

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken, resetTokenExpiresAt }
      });
      
      // Invalidate user cache
      await cacheHandler.delete(c, 'user', user.id);
      await cacheHandler.delete(c, 'profile', user.id);
    } else if (serviceProvider) {
      await prisma.serviceProvider.update({
        where: { id: serviceProvider.id },
        data: { resetPasswordToken, resetTokenExpiresAt }
      });
      
      // Invalidate service provider cache
      await cacheHandler.delete(c, 'user', serviceProvider.id);
      await cacheHandler.delete(c, 'profile', serviceProvider.id);
    }

    const resetLink = `${c.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    await sendPasswordResetEmail(c, email, resetLink);

    return c.json({ message: 'Password reset link has been sent to your email.' });
  } catch (e) {
    console.error('Error processing password reset request:', e);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// passowrd reset 
authRouter.post('/reset-password', async (c) => {
  const { token, newPassword } = await c.req.json();

  if (!token || !newPassword) {
    return c.json({ error: 'Token and new password are required' }, 400);
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findFirst({ where: { resetPasswordToken: token } });
    const serviceProvider = await prisma.serviceProvider.findFirst({ where: { resetPasswordToken: token } });

    if (!user && !serviceProvider) {
      return c.json({ error: 'Invalid or expired token' }, 400);
    }

    if (user) {
      if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
        return c.json({ error: 'Token has expired' }, 400);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: newPassword,
          resetPasswordToken: null,
          resetTokenExpiresAt: null
        }
      });
      
      // Invalidate user cache
      await cacheHandler.delete(c, 'user', user.id);
      await cacheHandler.delete(c, 'profile', user.id);
    } else if (serviceProvider) {
      if (serviceProvider.resetTokenExpiresAt && serviceProvider.resetTokenExpiresAt < new Date()) {
        return c.json({ error: 'Token has expired' }, 400);
      }

      await prisma.serviceProvider.update({
        where: { id: serviceProvider.id },
        data: {
          password: newPassword,
          resetPasswordToken: null,
          resetTokenExpiresAt: null
        }
      });
      
      // Invalidate service provider cache
      await cacheHandler.delete(c, 'user', serviceProvider.id);
      await cacheHandler.delete(c, 'profile', serviceProvider.id);
    }

    return c.json({ message: 'Password reset successful. You can now log in.' });
  } catch (e) {
    console.error('Error resetting password:', e);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// additional-data
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
      
      // Invalidate profile cache
      await cacheHandler.delete(c, 'profile', userId);
    } catch (error) {
      await prisma.user.update({
        where: { id: userId },
        data: { address: address },
      });
      
      // Invalidate profile cache
      await cacheHandler.delete(c, 'profile', userId);
    }

    return c.json({ success: true });
  } catch (error: any) {
    console.error('Error processing additional data:', error);
    return c.json({ error: 'Failed to submit additional data', details: error.message }, 500);
  }
});

// fetchs id
authRouter.get("/me", jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;

  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const userId = user.id as string;
  
  // Try to get from cache first
  const cachedUserData = await cacheHandler.get(c, 'me', userId);
  if (cachedUserData) {
    return c.json(cachedUserData);
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    const serviceProfile = await prisma.serviceProvider.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    let userData;
    
    if (userProfile) {
      userData = { id: userProfile.id, role: "user" };
    } else if (serviceProfile) {
      userData = { id: serviceProfile.id, role: "serviceProvider" };
    } else {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Cache the user data
    await cacheHandler.set(c, 'me', userId, userData, 3600); // Cache for 1 hour
    
    return c.json(userData);
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return c.json({ error: "Failed to fetch user data", details: error.message }, 500);
  }
});

// Profile route (get)
authRouter.get('/profile', jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;

  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const userId = user.id as string;
  
  // Try to get from cache first
  const cachedProfile = await cacheHandler.get(c, 'profile', userId);
  if (cachedProfile) {
    return c.json(cachedProfile);
  }

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
      select: { id: true, name: true, email: true, contactNo: true, address: true },
    });

    let profileData;
    
    if (userProfile) {
      profileData = userProfile;
    } else if (serviceProfile) {
      profileData = serviceProfile;
    } else {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Cache the profile data
    await cacheHandler.set(c, 'profile', userId, profileData, 1800); // Cache for 30 minutes
    
    return c.json(profileData);
  } catch (error: any) {
    console.error('Error fetching profile data:', error);
    return c.json({ error: 'Failed to fetch profile data', details: error.message }, 500);
  }
});


// Profile route (put)
authRouter.put('/profile', jwtAuthMiddleware, async (c) => {
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

    let updatedProfile;
    
    if (role === 'service') {
      updatedProfile = await prisma.serviceProvider.update({
        where: { id: userId },
        data: { ...body },
        select: { id: true, name: true, email: true, contactNo: true, address: true }
      });
    } else if (role === 'user') {
      updatedProfile = await prisma.user.update({
        where: { id: userId },
        data: { ...body },
        select: { id: true, name: true, email: true, contactNo: true, address: true }
      });
    } else {
      return c.json({ error: 'Invalid role' }, 400);
    }
    
    // Update cache with new profile data
    await cacheHandler.set(c, 'profile', userId, updatedProfile, 1800); // Cache for 30 minutes
    
    return c.json(updatedProfile);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile', details: error.message }, 500);
  }
});

// Update password route
authRouter.put('/update-password', jwtAuthMiddleware, async (c) => {
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
        
        // Invalidate service provider caches
        await cacheHandler.delete(c, 'user', userId);
        await cacheHandler.delete(c, 'profile', userId);
        await cacheHandler.delete(c, 'me', userId);
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
        
        // Invalidate user caches
        await cacheHandler.delete(c, 'user', userId);
        await cacheHandler.delete(c, 'profile', userId);
        await cacheHandler.delete(c, 'me', userId);
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