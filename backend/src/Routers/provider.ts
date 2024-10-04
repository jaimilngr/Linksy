import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { jwtAuthMiddleware } from './user'; 
import { Status } from 'cloudinary';

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
  availability: string;
  lat: number;
  lng: number;
}

interface ClosestServicesBody {
  latitude: number;
  longitude: number;
  category: string;
}

interface CreateServiceReqBody {
  date: string;
  time: string;
  role: string;
}

serviceRouter.use('/create', jwtAuthMiddleware);
serviceRouter.use('/myservices', jwtAuthMiddleware);
serviceRouter.use('/update/:serviceid', jwtAuthMiddleware);
serviceRouter.use('/delete/:serviceid', jwtAuthMiddleware);
serviceRouter.use('/createreq/:serviceid', jwtAuthMiddleware);
serviceRouter.use('/ticket', jwtAuthMiddleware);

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
        availability: body.availability,
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
        availability: body.availability,
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
        reviewCount:true,
        price: true,
        timing: true,
        contactNo: true,
        latitude: true, 
        longitude: true, 
        rating:true,
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


// fetch service request tickets 

serviceRouter.get('/ticket', async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;

  try {
    const servicereq = await prisma.ticket.findMany({
      where: {
        OR: [
          { userId: userId },    
          { providerId: userId } ,
        ]
      },
      select: {
        id: true,
        serviceId: true,         
        time: true,              
        date: true,              
        status: true,            
        service: {
          select: {
            name: true,           
          }
        }
      },
    });

  
    return c.json(servicereq);
  } catch (error: any) {
    console.error('Error fetching service requests: ', error);
    return c.json({ error: 'Failed to fetch service requests', details: error.message }, 500);
  }
});

// cancel request 

serviceRouter.put('/ticket/cancel/:ticketId', jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;
  const ticketId = c.req.param('ticketId'); 
  const { reason } = await c.req.json(); 



  try {
    const ticketIdNumber = parseInt(ticketId as string, 10);

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketIdNumber,
      },
      include: {
        user: true,    
        provider: true,
        serviceOwner:true,
      },
    });

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    if (ticket.userId !== userId && ticket.providerId !== userId) {
      return c.json({ error: 'Unauthorized action' }, 403);
    }

     await prisma.ticket.update({
      where: {
        id: ticketIdNumber,
      },
      data: {
        status: 'cancel',  
        cancellationReason: reason || 'No reason provided', 
      },
    });


     const notificationContent = `Ticket has been canceled. Reason: ${reason || 'No reason provided'}.`;
     await prisma.notification.update({
      where: {
        ticketId: ticketIdNumber,
      },
       data: {
         content: notificationContent,
         userId: ticket.userId || null, 
         providerId: ticket.providerId || null, 
         serviceownedId: ticket.serviceownedId,
       },
     });


    return c.json({ message : "ticket marked as cancelled "} , 200);  
  } catch (error: any) {
    console.error('Error canceling the ticket: ', error);
    return c.json({ error: 'Failed to cancel the ticket', details: error.message }, 500);
  }
});


// done request 
serviceRouter.put('/ticket/done/:ticketId', jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;
  const ticketId = c.req.param('ticketId');
  const { rating, comment } = await c.req.json(); 

  try {
    const ticketIdNumber = parseInt(ticketId as string, 10);

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketIdNumber,
      },
      include: {
        user: true,
        provider: true,
        service: true,  
      },
    });

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    if (ticket.userId !== userId && ticket.providerId !== userId) {
      return c.json({ error: 'Unauthorized action' }, 403);
    }

    await prisma.ticket.update({
      where: {
        id: ticketIdNumber,
        status: 'working'
      },
      data: {
        status: 'done',
      },
    });

    await prisma.review.create({
      data: {
        ticketId: ticketIdNumber,
        serviceId: ticket.serviceId,
        rating: rating,
        comment: comment || 'No comment provided',
      },
    });

    const calculateAverageRating = (reviews: { rating: number }[]) => {
      if (reviews.length === 0) return 0;
      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      return parseFloat((totalRating / reviews.length).toFixed(1));
    };

    const reviews = await prisma.review.findMany({
      where: { serviceId: ticket.serviceId },
      select: { rating: true },
    });

    const averageRating = calculateAverageRating(reviews);

    const reviewCount = await prisma.review.count({
      where: { serviceId: ticket.serviceId },
    });
    await prisma.service.update({
      where: { id: ticket.serviceId },
      data: { 
        rating: averageRating,
        reviewCount: reviewCount}, 
    });

    return c.json({ message: "Ticket marked as done and review created." }, 200);  
  } catch (error: any) {
    console.error('Error marking ticket as done and creating review: ', error);
    return c.json({ error: 'Failed to mark ticket as done and create review', details: error.message }, 500);
  }
});

// management status request

serviceRouter.put('/ticket/:status/:ticketId', jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;
  const ticketId = c.req.param('ticketId');
  const status = c.req.param('status');

  try {
    const ticketIdNumber = parseInt(ticketId as string, 10);

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: ticketIdNumber,
        serviceownedId: userId,
      },
      include: {
        user: true,
        provider: true,
        service: true,
      },
    });

    if (!ticket) {
      return c.json({ error: 'Ticket not found' }, 404);
    }

    if (!ticket.serviceownedId || ticket.serviceownedId !== userId) {
      return c.json({ error: 'Unauthorized action' }, 403);
    }

    if (status !== 'working' && status !== 'rejected') {
      return c.json({ error: 'Invalid status parameter' }, 400);
    }

     await prisma.ticket.update({
      where: {
        id: ticketIdNumber,
      },
      data: {
        status: status, 
      },
    });
    const serviceName = ticket.service?.name || "the service"; 
    let notificationMessage = `Your ticket status has been ${status === 'working' ? 'accepted' : status}. for ${serviceName}.`;

    if (ticket.userId) {
      const userExists = await prisma.user.findUnique({
        where: { id: ticket.userId },
      });
      if (userExists) {
        await prisma.notification.create({
          data: {
            userId: ticket.userId,
            content: notificationMessage,
            ticketId: ticketIdNumber,
          },
        });
      } else {
        return c.json({ error: `User with ID ${ticket.userId} does not exist. Notification not created.` }, 400);
      }
    } else if (ticket.providerId) {
      const providerExists = await prisma.serviceProvider.findUnique({
        where: { id: ticket.providerId },
      });
      if (providerExists) {
        await prisma.notification.create({
          data: {
            providerId: ticket.providerId,
            content: notificationMessage,
            ticketId: ticketIdNumber,
          },
        });
      } else {
        return c.json({ error: `Provider with ID ${ticket.providerId} does not exist. Notification not created.` }, 400);
      }
    }


    return c.json({ message: 'Ticket status updated successfully' }, 200);
  } catch (error: any) {
    console.error('Error updating ticket status: ', error);
    return c.json({ error: 'Failed to update ticket status', details: error.message }, 500);
  }
});


// Create service request 

serviceRouter.post('/createreq/:serviceid', async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;

  try {
    const serviceId = c.req.param('serviceid');

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { providerId: true },
    });

    if (!service) {
      return c.json({ error: 'Service provider not found' }, 404);
    }

    const serviceownedId = service.providerId; 
    if (userId === serviceownedId) {
      return c.json({ error: "You can't request your own services." }, 403);
    }
    const body: CreateServiceReqBody = await c.req.json();

    if (!body.date || !body.time || !body.role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const providerId = body.role === 'service' ? userId : null; 

    const servicereq = await prisma.ticket.create({
      data: {
        userId: body.role === 'service' ? null : userId, 
        serviceId: serviceId,
        providerId: providerId, 
        serviceownedId: serviceownedId, 
        status: "pending",
        time: body.time,
        date: body.date,
        role: body.role,
      },
    });

    let notificationContent: string;
    if (body.role === 'service') {
      const providerUser = await prisma.serviceProvider.findUnique({
        where: { id: userId }, 
        select: { name: true },
      });
      notificationContent = `New service request by  ${providerUser?.name || 'Service Provider'}`;
    } else {
      const userMakingRequest = await prisma.user.findUnique({
        where: { id: userId }, 
        select: { name: true },
      });
      notificationContent = `New service request by ${userMakingRequest?.name || 'User'}`;
    }

    await prisma.notification.create({
      data: {
        userId: body.role === 'service' ? null : userId, 
        providerId: providerId, 
        ticketId: servicereq.id, 
        content: notificationContent,
        read: false,
        serviceownedId: serviceownedId, 
      },
    });


    return c.json({message: "request created"},200);
  } catch (error: any) {
    console.error('Error creating service request:', error);
    return c.json({ error: 'Failed to create service request', details: error.message }, 500);
  }
});


// schedule route 
serviceRouter.get('/schedule',jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = user.id as string;
  try {
    const schedule = await prisma.ticket.findMany({
      where: {
        serviceownedId: userId,
        OR: [
          { role: "service" },
          { role: "user" }
        ],
        status:"working",
      },
      select: {
        id: true,
        serviceId: true,
        time: true,
        date: true,
        status: true,
        service: {
          select: {
            name: true,
            price: true,
            category: true,
          }
        },
        user: {
          select: {
            name: true,
            address: true,
            contactNo: true,
          }
        },
        provider: {
          select: {
            name: true,
            contactNo: true,
          }
        }
      },
    });
    return c.json(schedule);
  } catch (error: any) {
    console.error('Error fetching service requests: ', error);
    return c.json({ error: 'Failed to fetch service requests', details: error.message }, 500);
  }
});


// manage route 
serviceRouter.get('/manage',jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = user.id as string;
  try {
    const manage = await prisma.ticket.findMany({
      where: {
        serviceownedId: userId,
        OR: [
          { role: "service" },
          { role: "user" }
        ],
        status:"pending",
      },
      select: {
        id: true,
        serviceId: true,
        time: true,
        date: true,
        status: true,
        service: {
          select: {
            name: true,
            price: true,
            category: true,
          }
        },
        user: {
          select: {
            name: true,
            address: true,
            contactNo: true,
          }
        },
        provider: {
          select: {
            name: true,
            contactNo: true,
          }
        }
      },
    });
    return c.json(manage);
  } catch (error: any) {
    console.error('Error fetching service requests: ', error);
    return c.json({ error: 'Failed to fetch service requests', details: error.message }, 500);
  }
});

// Fetch notifications
serviceRouter.get('/notifications', jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          {
            serviceownedId: userId, 
          },
          {
            serviceownedId: null,
            OR: [
              { userId: userId }, 
              { providerId: userId },
            ],
          },
        ],
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        ticket: {
          select: {
            status: true,
          },
        },
      },
    });


    return c.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications: ', error);
    return c.json({ error: 'Failed to fetch notifications', details: error.message }, 500);
  }
});


// fetch service
serviceRouter.get('/:serviceId', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const serviceId  = c.req.param('serviceId'); 

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
      },
      select: {
        name: true,
        description: true,
        price: true,
        timing: true,
        category: true,
        latitude: true,
        longitude: true,
        contactNo: true,
        availability: true,
        rating: true,
        reviews: {
          select: {
            comment: true,
            ticket: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
                provider: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!service) {
      return c.json({ error: "Service not found or you don't have access" }, 404);
    }

    return c.json(service);
  } catch (error: any) {
    console.error('Error fetching service details:', error);
    return c.json({ error: 'Failed to fetch service details', details: error.message }, 500);
  }
});
