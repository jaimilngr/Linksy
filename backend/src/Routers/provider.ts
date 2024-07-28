import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import cloudinary from '../cloudinaryconfig';


export const serviceRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  }
}>();


