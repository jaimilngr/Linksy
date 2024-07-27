import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono"
import { sign } from "hono/jwt";

export const providerRouter = new Hono< {
    Bindings:{
        DATABASE_URL: string;
        JWT_Secret: string;
    }
}>();


providerRouter.post("/signup", async (c) =>{
    const body = await c.req.json();


    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    
      try{
        const provider = await prisma.serviceProvider.create({
            data:{
                name:body.name,
                email:body.email,
                password: body.password,    
                contactNo: body.contactNo,
                type: body.type,
                location: body.location
            },
            select:{
                id:true,
                name:true
            }
        });

        const token = await sign({id: provider.id},c.env.JWT_Secret)
        return c.json({
            jwt:token,
            name: provider.name,
            id:provider.id
        });
      } catch(e){
        c.status(403);
        return c.text("User already exist with same email");
      }
});

providerRouter.post("/signin", async (c)=>{

    const body = await c.req.json();

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());

        const provider = await prisma.serviceProvider.findUnique({
            where:{
                email: body.email,
                password: body.password
            },
            select:{
                id:true,
                name:true
            }
        });
      
        if(!provider){
            c.status(403);
            return c.json({
                error:"User not Found"
            });
        }

        const token = await sign({id: provider.id}, c.env.JWT_Secret);
        return c.json({
            jwt:token,
            name: provider.name,
            id: provider.id
        });
})




