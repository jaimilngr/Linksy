import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { jwtAuthMiddleware } from './user';

export const commentRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        Jwt_Secret: string;
    }
    Variables: {
        userId: string;
    }
}>();

commentRouter.post("/:serviceId", jwtAuthMiddleware, async (c) => {
    const user = (c.req as any).user;

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const userId = user.id as string;

    try {
        const body = await c.req.json();

        if (!userId) {
            c.status(401);
            return c.json({ message: "User not authenticated" });
        }

        if (!body.content || !body.serviceId) {
            c.status(400); 
            return c.json({ message: "Content and Post ID are required" });
        }

        const comment = await prisma.comment.create({
            data: {
                content: body.content,
                userId: userId,
                serviceId: body.serviceId,
                parentId: body.parentId || null, 
        }});

        return c.json({ id: comment.id }, 201); 
    } catch (error: any) {
        console.error("Error creating comment:", error);
        c.status(500); // Internal Server Error
        return c.json({
            message: "An error occurred while creating the comment",
            error: error.message
        });
    } finally {
        await prisma.$disconnect(); // Ensure proper disconnection
    }
});

commentRouter.get("/bulk/:serviceId", async (c: any) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const serviceId = c.req.param("serviceId");

    if (!serviceId) {
        return c.json({ error: "Post ID is required" }, { status: 400 });
    }

    try {
        const comments = await prisma.comment.findMany({
            where: {
                serviceId: serviceId, 
            },
            select: {
                id: true,
                content: true,
                user: {
                    select: {
                        name: true,
                    }
                },
                parentId: true,
                replies: {
                    select: {
                        id: true,
                        content: true,
                        user: {
                            select: {
                                name: true,
                            }
                        }
                    }
                }
            }
        });

        return c.json({ comments });
    } catch (error) {
        console.error("Error fetching comments:", error);
        return c.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        await prisma.$disconnect(); // Ensure proper disconnection
    }
});
