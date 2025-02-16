import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { jwtAuthMiddleware } from "./user";

export const serviceRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
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


interface CreateServiceReqBody {
  date: string;
  time: string;
  role: string;
}

serviceRouter.use("/create", jwtAuthMiddleware);
serviceRouter.use("/myservices", jwtAuthMiddleware);
serviceRouter.use("/update/:serviceid", jwtAuthMiddleware);
serviceRouter.use("/delete/:serviceid", jwtAuthMiddleware);
serviceRouter.use("/createreq/:serviceid", jwtAuthMiddleware);
serviceRouter.use("/ticket", jwtAuthMiddleware);

serviceRouter.post("/create", async (c) => {
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
      return c.json({ error: "Service provider not found" }, 404);
    }

    if (
      serviceProvider.suspendedUntilForReject &&
      new Date() < new Date(serviceProvider.suspendedUntilForReject)
    ) {
      return c.json(
        { error: "Service provider is suspended. Cannot create services." },
        403
      );
    }

    const body: ServiceCreateBody = await c.req.json();

    if (
      !body.serviceType ||
      !body.name ||
      !body.price ||
      !body.timing ||
      !body.category ||
      !body.contactNo ||
      !body.lat ||
      !body.lng
    ) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (
      typeof body.price !== "number" ||
      typeof body.lat !== "number" ||
      typeof body.lng !== "number"
    ) {
      return c.json({ error: "Invalid data types" }, 400);
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
    console.error("Error creating service:", error);
    return c.json(
      { error: "Failed to create service", details: error.message },
      500
    );
  }
});

serviceRouter.get("/myservices", async (c) => {
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
      return c.json({
        message: "You don't have any services. Create one now!",
      });
    }

    return c.json(services);
  } catch (error: any) {
    console.error("Error fetching services:", error);
    return c.json(
      { error: "Failed to fetch services", details: error.message },
      500
    );
  }
});

// Update Service Route
serviceRouter.put("/update/:serviceid", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = (c.req as any).user;
    const { serviceid } = c.req.param();
    const body: Partial<ServiceCreateBody> = await c.req.json();

    if (!serviceid) {
      return c.json({ error: "Service ID is required" }, 400);
    }

    const existingService = await prisma.service.findUnique({
      where: { id: serviceid },
    });

    if (!existingService) {
      return c.json({ error: "Service not found" }, 404);
    }

    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { id: existingService.providerId },
    });

    if (!serviceProvider) {
      return c.json({ error: "Service provider not found" }, 404);
    }

    if (
      serviceProvider.suspendedUntilForReject &&
      new Date() < new Date(serviceProvider.suspendedUntilForReject)
    ) {
      return c.json(
        { error: "Service provider is suspended. Cannot update services." },
        403
      );
    }

    if (existingService.providerId !== user.id) {
      return c.json({ error: "Unauthorized" }, 403);
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
    console.error("Error updating service:", error);
    return c.json(
      { error: "Failed to update service", details: error.message },
      500
    );
  }
});

// Delete Service Route

serviceRouter.delete("/delete/:serviceid", async (c) => {
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
      return c.json({ error: "Service not found" }, 404);
    }

    if (existingService.providerId !== user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    await prisma.service.delete({
      where: {
        id: serviceid,
      },
    });

    return c.json({ message: "Service deleted successfully" }, 200);
  } catch (error: any) {
    console.error("Error deleting service:", error);
    return c.json(
      { error: "Failed to delete service", details: error.message },
      500
    );
  }
});

// // Search Service Route

// serviceRouter.get("/closest", async (c) => {
//   const prisma = new PrismaClient({
//     datasourceUrl: c.env.DATABASE_URL,
//   }).$extends(withAccelerate());

//   try {
//     const latitudeQuery = c.req.query("latitude");
//     const longitudeQuery = c.req.query("longitude");
//     const category = c.req.query("category");

//     if (!latitudeQuery || !longitudeQuery || !category) {
//       return c.json({ error: "Missing parameters" }, 400);
//     }

//     const latitude = parseFloat(latitudeQuery);
//     const longitude = parseFloat(longitudeQuery);

//     if (isNaN(latitude) || isNaN(longitude)) {
//       return c.json({ error: "Invalid latitude or longitude" }, 400);
//     }

//     if (typeof category !== "string") {
//       return c.json({ error: "Invalid category" }, 400);
//     }

//     const services = await prisma.service.findMany({
//       where: {
//         category: category,
//       },
//       select: {
//         id: true,
//         providerId: true,
//         name: true,
//         description: true,
//         reviewCount: true,
//         price: true,
//         timing: true,
//         contactNo: true,
//         latitude: true,
//         longitude: true,
//         rating: true,
//       },
//     });

//     if (services.length === 0) {
//       return c.json([], 200);
//     }

//     const calculateDistance = (
//       lat1: number,
//       lng1: number,
//       lat2: number,
//       lng2: number
//     ) => {
//       const R = 6371;
//       const dLat = (lat2 - lat1) * (Math.PI / 180);
//       const dLng = (lng2 - lng1) * (Math.PI / 180);
//       const a =
//         Math.sin(dLat / 2) ** 2 +
//         Math.cos(lat1 * (Math.PI / 180)) *
//           Math.cos(lat2 * (Math.PI / 180)) *
//           Math.sin(dLng / 2) ** 2;
//       const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//       return R * c;
//     };

//     const servicesWithDistance = services.map((service) => {
//       const distance = calculateDistance(
//         latitude,
//         longitude,
//         service.latitude,
//         service.longitude
//       );
//       return { ...service, distance };
//     });

//     servicesWithDistance.sort((a, b) => a.distance - b.distance);

//     return c.json(servicesWithDistance, {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//   } catch (error: any) {
//     console.error("Error retrieving closest services:", error);
//     return c.json(
//       { error: "Failed to retrieve closest services", details: error.message },
//       500
//     );
//   }
// });
serviceRouter.get("/closest", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const latitudeQuery = c.req.query("latitude");
    const longitudeQuery = c.req.query("longitude");
    const category = c.req.query("category");
    const sortByQuery = c.req.query("sortBy") || ""; // Default sorting by location (no sortBy)

    if (!latitudeQuery || !longitudeQuery || !category) {
      return c.json({ error: "Missing parameters" }, 400);
    }

    const latitude = parseFloat(latitudeQuery);
    const longitude = parseFloat(longitudeQuery);

    if (isNaN(latitude) || isNaN(longitude)) {
      return c.json({ error: "Invalid latitude or longitude" }, 400);
    }

    if (typeof category !== "string") {
      return c.json({ error: "Invalid category" }, 400);
    }

    // Parse the sortBy query to handle price_min and price_max
    const sortBy = sortByQuery.split(",");
    let priceMin: number | undefined = undefined;
    let priceMax: number | undefined = undefined;
    let sortPrice: string = "";

    sortBy.forEach((criterion) => {
      if (criterion.startsWith("price_min:")) {
        const priceValue = parseFloat(criterion.split(":")[1]);
        if (!isNaN(priceValue)) {
          priceMin = priceValue;
        }
      } else if (criterion.startsWith("price_max:")) {
        const priceValue = parseFloat(criterion.split(":")[1]);
        if (!isNaN(priceValue)) {
          priceMax = priceValue;
        }
      } else if (["price_asc", "price_desc"].includes(criterion)) {
        sortPrice = criterion;
      }
    });

    // Split the sortBy query to handle multiple sorting options
    const services = await prisma.service.findMany({
      where: {
        category,
        ...(priceMin !== undefined && priceMax !== undefined
          ? { price: { gte: priceMin, lte: priceMax } }
          : priceMin !== undefined
          ? { price: { gte: priceMin } }
          : priceMax !== undefined
          ? { price: { lte: priceMax } }
          : {}),
      },
      select: {
        id: true,
        providerId: true,
        name: true,
        description: true,
        reviewCount: true,
        price: true,
        timing: true,
        contactNo: true,
        latitude: true,
        longitude: true,
        rating: true,
      },
    });

    if (services.length === 0) {
      return c.json([], 200);
    }

    // Calculate the distance between two points
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; // Radius of the Earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLng = (lng2 - lng1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
    };

    // Map services and calculate their distance
    const servicesWithDistance = services.map((service) => ({
      ...service,
      distance: calculateDistance(latitude, longitude, service.latitude, service.longitude),
    }));

    // Sort services first by distance (default behavior)
    servicesWithDistance.sort((a, b) => a.distance - b.distance);

    // Handle sorting by price (if specified in sortBy)
    if (sortPrice) {
      if (sortPrice === "price_asc") {
        servicesWithDistance.sort((a, b) => a.price - b.price); // Lowest price first
      } else if (sortPrice === "price_desc") {
        servicesWithDistance.sort((a, b) => b.price - a.price); // Highest price first
      }
    }

    // If a specific sortBy option (rating or reviews or price) is provided, sort accordingly
    if (sortBy.length > 0) {
      for (const criterion of sortBy) {
        if (criterion === "rating_desc") {
          servicesWithDistance.sort((a, b) => b.rating - a.rating); // Highest rated first
        } else if (criterion === "rating_asc") {
          servicesWithDistance.sort((a, b) => a.rating - b.rating); // Lowest rated first
        } else if (criterion === "reviews_asc") {
          servicesWithDistance.sort((a, b) => a.reviewCount - b.reviewCount); // Lowest reviewed first
        } else if (criterion === "reviews_desc") {
          servicesWithDistance.sort((a, b) => b.reviewCount - a.reviewCount); // Most reviewed first
        }
      }
    }

    return c.json(servicesWithDistance, { headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Error retrieving closest services:", error);
    return c.json({ error: "Failed to retrieve closest services", details: error.message }, 500);
  }
});



// fetch service request tickets

serviceRouter.get("/ticket", async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;

  
  try {
    const servicereq = await prisma.ticket.findMany({
      where: {
        OR: [{ userId: userId }, { providerId: userId }],
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
          },
        },
        user: {
          select: {
            cancelLimit: true, 
          },
        },
        provider: {
          select: {
            cancelLimit: true, 
          },
        },
      },
    });

    return c.json(servicereq);
  } catch (error: any) {
    console.error("Error fetching service requests: ", error);
    return c.json(
      { error: "Failed to fetch service requests", details: error.message },
      500
    );
  }
});

// cancel request

serviceRouter.put("/ticket/cancel/:ticketId", jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;
  const ticketId = c.req.param("ticketId");
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
        serviceOwner: true,
      },
    });

    if (!ticket) {
      return c.json({ error: "Ticket not found" }, 404);
    }

    if (ticket.userId !== userId && ticket.providerId !== userId) {
      return c.json({ error: "Unauthorized action" }, 403);
    }

    // Check if the user is suspended
    const userSuspended = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspendedUntil: true }, 
    });

    const currentTime = new Date();
    if (userSuspended?.suspendedUntil && userSuspended.suspendedUntil > currentTime) {
      return c.json({ error: "Your account is suspended for Excessive cancel request. " }, 403);
    }

    // Check if the user is suspended
    const providerSuspended = await prisma.serviceProvider.findUnique({
      where: { id: userId },
      select: { suspendedUntilForCancel: true }, 
    });

    if (providerSuspended?.suspendedUntilForCancel && providerSuspended.suspendedUntilForCancel > currentTime) {
      return c.json({ error: "Your account is suspended for Excessive cancel request." }, 403);
    }


    const cancellationsCount = await prisma.ticket.count({
      where: {
        OR: [
          {
            userId: userId,
          },
          {
            providerId: userId,
          },
        ],
        status: "cancel",
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

   

    const cancelLimit = 2;

      // Check if cancellation limit is reached
      if (cancellationsCount >= cancelLimit) {
        // Set suspension duration (e.g., 24 hours)
        const suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
        // Update suspension status for the user or provider
        if (ticket.userId === userId) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              suspendedUntil: suspendedUntil, 
            },
          });
  
          // Expire all pending tickets for this user
          await prisma.ticket.updateMany({
            where: {
              userId: userId,
              status: "pending",
            },
            data: {
              status: "expired",
            },
          });
        } else {
          await prisma.serviceProvider.update({
            where: { id: userId },
            data: {
              suspendedUntilForCancel: suspendedUntil,
            },
          });
  
          // Expire all pending tickets for this service provider
          await prisma.ticket.updateMany({
            where: {
              providerId: userId,
              status: "pending",
            },
            data: {
              status: "expired",
            },
          });
        }
  
        return c.json({ error: "Cancellation limit reached. You have been suspended for 24 hours.", status: 403 });
      }


    const userOrProviderId = ticket.userId === userId ? ticket.userId : ticket.providerId;

    // Update cancel limit for user or service provider
    if (userOrProviderId) {
      if (ticket.userId === userId) {
        await prisma.user.update({
          where: { id: userOrProviderId },
          data: {
            cancelLimit: {
              increment: 1,
            },
          },
        });
      } else {
        await prisma.serviceProvider.update({
          where: { id: userOrProviderId },
          data: {
            cancelLimit: {
              increment: 1,
            },
          },
        });
      }
    }


    await prisma.ticket.update({
      where: {
        id: ticketIdNumber,
      },
      data: {
        status: "cancel",
        cancellationReason: reason || "No reason provided",
      },
    });

    const notificationContent = `Ticket has been canceled. Reason: ${
      reason || "No reason provided"
    }.`;
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
 
    return c.json({ message: "ticket marked as cancelled " }, 200);
  } catch (error: any) {
    console.error("Error canceling the ticket: ", error);
    return c.json(
      { error: "Failed to cancel the ticket", details: error.message },
      500
    );
  }
});

// done request
serviceRouter.put("/ticket/done/:ticketId", jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;
  const ticketId = c.req.param("ticketId");
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
      return c.json({ error: "Ticket not found" }, 404);
    }

    if (ticket.userId !== userId && ticket.providerId !== userId) {
      return c.json({ error: "Unauthorized action" }, 403);
    }

    await prisma.ticket.update({
      where: {
        id: ticketIdNumber,
        status: "working",
      },
      data: {
        status: "done",
      },
    });

    await prisma.review.create({
      data: {
        ticketId: ticketIdNumber,
        serviceId: ticket.serviceId,
        rating: rating,
        comment: comment || "No comment provided",
      },
    });

    const calculateAverageRating = (reviews: { rating: number }[]) => {
      if (reviews.length === 0) return 0;
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
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
        reviewCount: reviewCount,
      },
    });

    return c.json(
      { message: "Ticket marked as done and review created." },
      200
    );
  } catch (error: any) {
    console.error("Error marking ticket as done and creating review: ", error);
    return c.json(
      {
        error: "Failed to mark ticket as done and create review",
        details: error.message,
      },
      500
    );
  }
});

// Management status request
serviceRouter.put("/ticket/:status/:ticketId", jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;
  const ticketId = c.req.param("ticketId");
  const status = c.req.param("status");

  try {
    const ticketIdNumber = parseInt(ticketId as string, 10);

    // Fetch the ticket with necessary relations
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

    // Validate the existence of the ticket
    if (!ticket) {
      return c.json({ error: "Ticket not found" }, 404);
    }

    // Validate the user's permission to manage the ticket
    if (!ticket.serviceownedId || ticket.serviceownedId !== userId) {
      return c.json({ error: "Unauthorized action" }, 403);
    }

    // Check if the ticket request has expired
    if (ticket.createdAt < new Date(Date.now() - 2 * 60 * 60 * 1000)) {
      return c.json({ error: "Ticket request has expired" }, 403);
    }

    // Validate status parameter
    if (status !== "working" && status !== "rejected") {
      return c.json({ error: "Invalid status parameter" }, 400);
    }

    // Handle rejection logic
    if (status === "rejected") {
      const rejectionCount = await prisma.ticket.count({
        where: {
          serviceownedId: userId,
          status: "rejected",
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      const rejectLimit = 3; // Set your reject limit here

         // Increment the reject limit for the service provider
         await prisma.serviceProvider.update({
          where: { id: ticket.serviceownedId },
          data: {
            rejectLimit: { increment: 1 },
          },
        });

          if (rejectionCount >= rejectLimit) {
        // Suspend the service provider
        const suspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Suspension until tomorrow
        
        // Update the service provider to set suspension status
        await prisma.serviceProvider.update({
          where: { id: userId },
          data: { suspendedUntilForReject: suspendedUntil },
        });

       
        // Set all services of the provider to unavailable
        await prisma.service.updateMany({
          where: { providerId: userId },
          data: { availability: "No" }, // Assuming "availability" is the field to update
        });

        // Expire all pending tickets owned by the service provider
        await prisma.ticket.updateMany({
          where: {
            serviceownedId: userId,
            status: "pending", // Only affect pending tickets
          },
          data: { status: "expired" }, // Change status to expired
        });

        return c.json({ error: "You have been suspended for exceeding the rejection limit.", status: 403 });
      }
    }

    // Update the ticket status
    await prisma.ticket.update({
      where: {
        id: ticketIdNumber,
      },
      data: {
        status: status,
      },
    });

    // Construct notification message
    const serviceName = ticket.service?.name || "the service";
    const notificationMessage = `Your ticket status has been ${status === "working" ? "accepted" : "rejected"} for ${serviceName}.`;

    // Update notification content
    const existingNotification = await prisma.notification.findUnique({
      where: { ticketId: ticketIdNumber },
    });

    if (existingNotification) {
      await prisma.notification.update({
        where: { ticketId: ticketIdNumber },
        data: {
          content: notificationMessage,
        },
      });
    }

    return c.json({ message: "Ticket status updated successfully" }, 200);
  } catch (error: any) {
    console.error("Error updating ticket status: ", error);
    return c.json(
      { error: "Failed to update ticket status", details: error.message },
      500
    );
  }
});

// Create service request

serviceRouter.post("/createreq/:serviceid", async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const userId = user.id as string;

  try {
    const serviceId = c.req.param("serviceid");

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { providerId: true },
    });

    if (!service) {
      return c.json({ error: "Service provider not found" }, 404);
    }

    const serviceownedId = service.providerId;
    if (userId === serviceownedId) {
      return c.json({ error: "You can't request your own services." }, 403);
    }

    const suspendedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { suspendedUntil: true },
    });

    const suspendedProvider = await prisma.serviceProvider.findUnique({
      where: { id: userId },
      select: { suspendedUntilForCancel: true },
    });

    const currentDate = new Date();
    
    if (suspendedUser && suspendedUser.suspendedUntil !== null && suspendedUser.suspendedUntil > currentDate) {
      return c.json({ error: "Your account is suspended until tomorrow due to excessive cancel request. You cannot create a service request." }, 403);
    }

    if (suspendedProvider && suspendedProvider.suspendedUntilForCancel !== null && suspendedProvider.suspendedUntilForCancel > currentDate) {
      return c.json({ error: "Your account is suspended until tomorrow due to excessive cancel request. You cannot create a service request." }, 403);
    }


    const body: CreateServiceReqBody = await c.req.json();

    if (!body.date || !body.time || !body.role) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const providerId = body.role === "service" ? userId : null;

    const servicereq = await prisma.ticket.create({
      data: {
        userId: body.role === "service" ? null : userId,
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
    if (body.role === "service") {
      const providerUser = await prisma.serviceProvider.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      notificationContent = `New service request by  ${
        providerUser?.name || "Service Provider"
      }`;
    } else {
      const userMakingRequest = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      notificationContent = `New service request by ${
        userMakingRequest?.name || "User"
      }`;
    }

    await prisma.notification.create({
      data: {
        userId: body.role === "service" ? null : userId,
        providerId: providerId,
        ticketId: servicereq.id,
        content: notificationContent,
        read: false,
        serviceownedId: serviceownedId,
      },
    });

    return c.json({ message: "request created" }, 200);
  } catch (error: any) {
    console.error("Error creating service request:", error);
    return c.json(
      { error: "Failed to create service request", details: error.message },
      500
    );
  }
});

// schedule route
serviceRouter.get("/schedule", jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = user.id as string;
  try {
    const schedule = await prisma.ticket.findMany({
      where: {
        serviceownedId: userId,
        OR: [{ role: "service" }, { role: "user" }],
        status: "working",
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
          },
        },
        user: {
          select: {
            name: true,
            address: true,
            contactNo: true,
          },
        },
        provider: {
          select: {
            name: true,
            address: true,
            contactNo: true,
          },
        },
      },
    });
    return c.json(schedule);
  } catch (error: any) {
    console.error("Error fetching service requests: ", error);
    return c.json(
      { error: "Failed to fetch service requests", details: error.message },
      500
    );
  }
});

// Manage route
serviceRouter.get("/manage", jwtAuthMiddleware, async (c) => {
  const user = (c.req as any).user;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const userId = user.id as string;

  try {
    // Check if the provider is suspended
    const suspendedProvider = await prisma.serviceProvider.findUnique({
      where: { id: userId },
      select: { suspendedUntilForReject: true },
    });

    const currentDate = new Date();

    // Check suspension status
    if (suspendedProvider && suspendedProvider.suspendedUntilForReject) {
      // If suspended until a future date, return an error response
      if (suspendedProvider.suspendedUntilForReject > currentDate) {
        return c.json({
          error: "Your account is suspended until tomorrow due to excessive service rejections . All your services are deactivated.",
        }, 403);
      }
    }

    // Fetch pending requests if not suspended
    const manage = await prisma.ticket.findMany({
      where: {
        serviceownedId: userId,
        OR: [{ role: "service" }, { role: "user" }],
        status: "pending",
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
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
          },
        },
        user: {
          select: {
            name: true,
            address: true,
            contactNo: true,
          },
        },
        provider: {
          select: {
            name: true,
            contactNo: true,
          },
        },
      },
    });


    // Fetch reject limit of the service provider
    const serviceOwner = await prisma.serviceProvider.findUnique({
      where: { id: userId },
      select: { rejectLimit: true },
    });

    // Prepare response
    return c.json({
      manage,
      rejectLimit: serviceOwner?.rejectLimit ?? null, 
    });

  } catch (error: any) {
    console.error("Error fetching service requests: ", error);
    return c.json(
      { error: "Failed to fetch service requests", details: error.message },
      500
    );
  }
});


// Fetch notifications
serviceRouter.get("/notifications", jwtAuthMiddleware, async (c) => {
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
            OR: [{ userId: userId }, { providerId: userId }],
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
    console.error("Error fetching notifications: ", error);
    return c.json(
      { error: "Failed to fetch notifications", details: error.message },
      500
    );
  }
});


// fetch service
serviceRouter.get("/:serviceId", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const serviceId = c.req.param("serviceId");

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
      return c.json(
        { error: "Service not found or you don't have access" },
        404
      );
    }

    return c.json(service);
  } catch (error: any) {
    console.error("Error fetching service details:", error);
    return c.json(
      { error: "Failed to fetch service details", details: error.message },
      500
    );
  }
});
