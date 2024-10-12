// cronTrigger.ts
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";


export const resetLimits = async (env: any) => {

  const prisma = new PrismaClient({
    datasources: {
      db: { url: env.DATABASE_URL },
    },
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

export const cronJob = async (env: any) => {
  await resetLimits(env);
};
