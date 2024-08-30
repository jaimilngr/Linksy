import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { jwtAuthMiddleware } from './user'; 

export const serviceRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  }
}>();

interface ServiceCreateBody {
  serviceType: string;
  name: string;
  description?: string;
  price: number;
  timing: string;
  category: string;
  contactNo: string;
  lat: number;
  lng: number;
}

interface ClosestServicesBody {
  latitude: number;
  longitude: number;
  category: string;
}

serviceRouter.use('/create', jwtAuthMiddleware);
serviceRouter.use('/myservices', jwtAuthMiddleware);
serviceRouter.use('/update/:serviceid', jwtAuthMiddleware);
serviceRouter.use('/delete/:serviceid', jwtAuthMiddleware);

serviceRouter.post('/create', async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;

  try {
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { id: userId },
    });

    if (!serviceProvider) {
      return c.json({ error: 'Service provider not found' }, 404);
    }

    const body: ServiceCreateBody = await c.req.json();

    if (!body.serviceType || !body.name || !body.price || !body.timing || !body.category || !body.contactNo || !body.lat || !body.lng) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (typeof body.price !== 'number' || typeof body.lat !== 'number' || typeof body.lng !== 'number') {
      return c.json({ error: 'Invalid data types' }, 400);
    }

    const service = await prisma.service.create({
      data: {
        providerId: userId,
        serviceType: body.serviceType,
        name: body.name,
        description: body.description,
        price: body.price,
        timing: body.timing,
        category: body.category,
        contactNo: body.contactNo,
        latitude: body.lat,
        longitude: body.lng,
      },
    });

    return c.json(service);
  } catch (error: any) {
    console.error('Error creating service:', error);
    return c.json({ error: 'Failed to create service', details: error.message }, 500);
  }
});

serviceRouter.get('/myservices', async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const userId = user.id;

    const services = await prisma.service.findMany({
      where: {
        providerId: userId,
      },
      include: {
        provider: true,
      },
    });

    if (services.length === 0) {
      return c.json({ message: "You don't have any services. Create one now!" });
    }

    return c.json(services);
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return c.json({ error: 'Failed to fetch services', details: error.message }, 500);
  }
});

serviceRouter.put('/update/:serviceid', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = (c.req as any).user;
    const { serviceid } = c.req.param();
    const body: Partial<ServiceCreateBody> = await c.req.json();

    if (!serviceid) {
      return c.json({ error: 'Service ID is required' }, 400);
    }

    const existingService = await prisma.service.findUnique({
      where: { id: serviceid },
    });

    if (!existingService) {
      return c.json({ error: 'Service not found' }, 404);
    }

    if (existingService.providerId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const updatedService = await prisma.service.update({
      where: { id: serviceid },
      data: {
        serviceType: body.serviceType,
        name: body.name,
        description: body.description,
        price: body.price,
        timing: body.timing,
        category: body.category,
        contactNo: body.contactNo,
        latitude: body.lat,
        longitude: body.lng,
      },
    });

    return c.json(updatedService);
  } catch (error: any) {
    console.error('Error updating service:', error);
    return c.json({ error: 'Failed to update service', details: error.message }, 500);
  }
});

serviceRouter.delete('/delete/:serviceid', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = (c.req as any).user;
    const { serviceid } = c.req.param();

    const existingService = await prisma.service.findUnique({
      where: {
        id: serviceid,
      },
    });

    if (!existingService) {
      return c.json({ error: 'Service not found' }, 404);
    }

    if (existingService.providerId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await prisma.service.delete({
      where: {
        id: serviceid,
      },
    });

    return c.json({ message: 'Service deleted successfully' }, 200);

  } catch (error: any) {
    console.error('Error deleting service:', error);
    return c.json({ error: 'Failed to delete service', details: error.message }, 500);
  }
});

// Public endpoint: no authentication required
serviceRouter.get('/closest', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const latitudeQuery = c.req.query('latitude');
    const longitudeQuery = c.req.query('longitude');
    const category = c.req.query('category');

    if (!latitudeQuery || !longitudeQuery || !category) {
      return c.json({ error: 'Missing parameters' }, 400);
    }

    const latitude = parseFloat(latitudeQuery);
    const longitude = parseFloat(longitudeQuery);

    if (isNaN(latitude) || isNaN(longitude)) {
      return c.json({ error: 'Invalid latitude or longitude' }, 400);
    }

    if (typeof category !== 'string') {
      return c.json({ error: 'Invalid category' }, 400);
    }

    const services = await prisma.service.findMany({
      where: {
        category: category,
      },
      select: {
        id: true,
        providerId: true,
        name: true,
        description: true,
        price: true,
        timing: true,
        contactNo: true,
        latitude: true, 
        longitude: true, 
      },
    });

    if (services.length === 0) {
      return c.json([], 200);
    }

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; 
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLng = (lng2 - lng1) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const servicesWithDistance = services.map(service => {
      const distance = calculateDistance(latitude, longitude, service.latitude, service.longitude);
      return { ...service, distance };
    });

    servicesWithDistance.sort((a, b) => a.distance - b.distance);

    return c.json(servicesWithDistance, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Error retrieving closest services:', error);
    return c.json({ error: 'Failed to retrieve closest services', details: error.message }, 500);
  }
});
