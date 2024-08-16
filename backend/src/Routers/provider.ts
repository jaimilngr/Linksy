import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export const serviceRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  }
}>();

interface ServiceCreateBody {
  userId: string;
  providerId: number;
  serviceType: string;
  name: string;
  description?: string;
  price?: number;
  timing?: string;
  category: string;
  imageUrl: string;
  location: string;
  contactNo: string;
}

serviceRouter.post('/create', async (c) => {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const body: ServiceCreateBody = await c.req.json();

    const service = await prisma.service.create({
      data: {
        userId: body.userId,
        providerId: body.providerId,
        serviceType: body.serviceType,
        name: body.name,
        description: body.description,
        price: body.price,
        timing: body.timing,
        category: body.category,
        images: [body.imageUrl],
        location: body.location,
        contactNo: body.contactNo,
      },
    });

    return c.json(service);
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: 'Failed to create service' });
  }
});


serviceRouter.post('/services/closest', async (c) => {
  const prisma = new PrismaClient().$extends(withAccelerate());

  try {
    const { latitude, longitude } = await c.req.json();
    const services = await prisma.service.findMany();

    const servicesWithDistance = services.map(service => {
      //@ts-ignore
      const distance = calculateDistance(latitude, longitude, service.latitude, service.longitude);
      return { ...service, distance };
    });

    servicesWithDistance.sort((a, b) => a.distance - b.distance);

    return c.json(servicesWithDistance.slice(0, 5));
  } catch (e) {
    console.error(e);
    c.status(500);
    return c.json({ error: 'Failed to retrieve closest services' });
  }
});

//@ts-ignore
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg:number) {
  return deg * (Math.PI / 180);
}

export default serviceRouter;
