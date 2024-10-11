// cronTrigger.ts
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";

export const crontriggerRoute = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    Jwt_Secret: string;
  };
}>();

// Function to reset the limits (pass environment for Prisma initialization)
export const resetLimits = async (env: any) => {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: env.DATABASE_URL }
    }
  }).$extends(withAccelerate());
  
  try {
    await prisma.user.updateMany({
      data: {
        cancelLimit: 0,
      },
    });

    await prisma.serviceProvider.updateMany({
      data: {
        rejectLimit: 0,
        cancelLimit: 0,
      },
    });

    console.log('Reject limits and cancel limits have been reset successfully.');
  } catch (error) {
    console.error('Error resetting limits: ', error);
  }
};

// Function to be invoked by the cron trigger
export const cronJob = async (env: any) => {
  await resetLimits(env);
};
