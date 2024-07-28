import z from "zod";

export const signupInput = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8,"Password must be atleast 8 characters"),
    name: z.string().min(1),
    contactNo: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid contact number"),
    type: z.string().optional(),
    location: z.string()
});

export type SignupType = z.infer<typeof signupInput>;

export const signinInput = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8,"Password must be at least 8 characters long"),
});

export type SigninType = z.infer<typeof signinInput>;

