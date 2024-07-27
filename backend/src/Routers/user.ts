import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono"
import { sign } from "hono/jwt";

export const userRouter = new Hono< {
    Bindings:{
        DATABASE_URL: string;
        JWT_Secret: string;
    }
}>();


userRouter.post("/signup", async (c) =>{
    const body = await c.req.json();


    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());
    
      try{
        const user = await prisma.user.create({
            data:{
                name:body.name,
                email:body.email,
                password: body.password,    
            },
            select:{
                id:true,
                name:true
            }
        });

        const token = await sign({id: user.id},c.env.JWT_Secret)
        return c.json({
            jwt:token,
            name: user.name,
            id:user.id
        });
      } catch(e){
        c.status(403);
        return c.text("User already exist with same email");
      }
});

userRouter.post("/signin", async (c)=>{

    const body = await c.req.json();

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate());

        const user = await prisma.user.findUnique({
            where:{
                email: body.email,
                password: body.password
            },
            select:{
                id:true,
                name:true
            }
        });
      
        if(!user){
            c.status(403);
            return c.json({
                error:"User not Found"
            });
        }

        const token = await sign({id: user.id}, c.env.JWT_Secret);
        return c.json({
            jwt:token,
            name: user.name,
            id: user.id
        });
})




